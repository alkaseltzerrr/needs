-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    neediness_level INTEGER DEFAULT 0 CHECK (neediness_level >= 0 AND neediness_level <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#FF6B6B',
    icon TEXT DEFAULT '🏠',
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group members table
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Create needs categories
CREATE TYPE need_category AS ENUM (
    'groceries',
    'chores',
    'emotional',
    'social',
    'food_craving',
    'help',
    'company',
    'other'
);

-- Create needs priority levels
CREATE TYPE need_priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);

-- Create needs table
CREATE TABLE IF NOT EXISTS public.needs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category need_category DEFAULT 'other',
    priority need_priority DEFAULT 'medium',
    is_fulfilled BOOLEAN DEFAULT FALSE,
    fulfilled_by UUID REFERENCES public.profiles(id),
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create needs responses table
CREATE TABLE IF NOT EXISTS public.need_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    need_id UUID NOT NULL REFERENCES public.needs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT,
    is_helping BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create neediness history table (tracks changes in neediness level)
CREATE TABLE IF NOT EXISTS public.neediness_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    old_level INTEGER NOT NULL,
    new_level INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    related_need_id UUID REFERENCES public.needs(id) ON DELETE CASCADE,
    related_group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX idx_needs_group_id ON public.needs(group_id);
CREATE INDEX idx_needs_created_by ON public.needs(created_by);
CREATE INDEX idx_needs_fulfilled ON public.needs(is_fulfilled);
CREATE INDEX idx_need_responses_need_id ON public.need_responses(need_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_needs_updated_at BEFORE UPDATE ON public.needs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update neediness level
CREATE OR REPLACE FUNCTION update_neediness_level(
    p_user_id UUID,
    p_delta INTEGER,
    p_reason TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_old_level INTEGER;
    v_new_level INTEGER;
BEGIN
    -- Get current level
    SELECT neediness_level INTO v_old_level
    FROM public.profiles
    WHERE id = p_user_id;
    
    -- Calculate new level (clamped between 0 and 100)
    v_new_level := GREATEST(0, LEAST(100, v_old_level + p_delta));
    
    -- Update profile
    UPDATE public.profiles
    SET neediness_level = v_new_level
    WHERE id = p_user_id;
    
    -- Record history
    INSERT INTO public.neediness_history (user_id, old_level, new_level, reason)
    VALUES (p_user_id, v_old_level, v_new_level, p_reason);
    
    RETURN v_new_level;
END;
$$ LANGUAGE plpgsql;

-- Function to atomically create a group and add creator as admin member
CREATE OR REPLACE FUNCTION public.create_group_with_admin_member(
    p_name TEXT,
    p_description TEXT DEFAULT NULL,
    p_color TEXT DEFAULT '#FF6B6B',
    p_icon TEXT DEFAULT '🏠'
)
RETURNS public.groups
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_group public.groups;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    INSERT INTO public.groups (name, description, color, icon, created_by)
    VALUES (
        p_name,
        NULLIF(TRIM(p_description), ''),
        COALESCE(p_color, '#FF6B6B'),
        COALESCE(p_icon, '🏠'),
        v_user_id
    )
    RETURNING * INTO v_group;

    INSERT INTO public.group_members (group_id, user_id, role)
    VALUES (v_group.id, v_user_id, 'admin')
    ON CONFLICT (group_id, user_id) DO NOTHING;

    RETURN v_group;
END;
$$;

REVOKE ALL ON FUNCTION public.create_group_with_admin_member(TEXT, TEXT, TEXT, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.create_group_with_admin_member(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- RLS Policies

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.need_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neediness_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Groups policies
CREATE POLICY "Groups viewable by members" ON public.groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = groups.id
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Groups can be created by authenticated users" ON public.groups
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Groups can be updated by admin members" ON public.groups
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = groups.id
            AND group_members.user_id = auth.uid()
            AND group_members.role = 'admin'
        )
    );

-- Group members policies
CREATE POLICY "Group members viewable by group members" ON public.group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = group_members.group_id
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Group admins can manage members" ON public.group_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = group_members.group_id
            AND gm.user_id = auth.uid()
            AND gm.role = 'admin'
        )
    );

-- Needs policies
CREATE POLICY "Needs viewable by group members" ON public.needs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = needs.group_id
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can create needs" ON public.needs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = needs.group_id
            AND group_members.user_id = auth.uid()
        ) AND auth.uid() = created_by
    );

CREATE POLICY "Need creators can update their needs" ON public.needs
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Need creators can delete their needs" ON public.needs
    FOR DELETE USING (auth.uid() = created_by);

-- Need responses policies
CREATE POLICY "Responses viewable by group members" ON public.need_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.needs
            JOIN public.group_members ON group_members.group_id = needs.group_id
            WHERE needs.id = need_responses.need_id
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can create responses" ON public.need_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.needs
            JOIN public.group_members ON group_members.group_id = needs.group_id
            WHERE needs.id = need_responses.need_id
            AND group_members.user_id = auth.uid()
        ) AND auth.uid() = user_id
    );

-- Neediness history policies
CREATE POLICY "Users can view own neediness history" ON public.neediness_history
    FOR SELECT USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', NULL)
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();