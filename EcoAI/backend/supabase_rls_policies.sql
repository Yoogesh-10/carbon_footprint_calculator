-- =============================================================
-- EcoAI Supabase Row Level Security (RLS) Policies
-- =============================================================

-- Enable Row Level Security on all core database tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. USER TABLE POLICIES
-- Users can read and update only their own profile
CREATE POLICY user_read_own_profile ON users
    FOR SELECT USING (auth.uid() = id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY user_update_own_profile ON users
    FOR UPDATE USING (auth.uid() = id);

-- 2. CARBON DATA POLICIES
-- Users can view, insert, and update only their own carbon records
CREATE POLICY user_manage_own_carbon ON carbon_data
    FOR ALL USING (user_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- 3. CONSENT RECORDS POLICIES
CREATE POLICY user_manage_own_consent ON consent_records
    FOR ALL USING (user_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- 4. PROFILE VERSIONS POLICIES
CREATE POLICY user_read_own_profile_versions ON profile_versions
    FOR SELECT USING (user_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- 5. PREDICTIONS POLICIES
CREATE POLICY user_read_own_predictions ON predictions
    FOR SELECT USING (user_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- 6. ORGANIZATION POLICIES
-- Organization role can read ONLY aggregated non-PII metrics (governed by API k-anonymity check)
CREATE POLICY org_read_consent_aggregated ON consent_records
    FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('organization', 'admin'));

-- 7. AUDIT LOG POLICIES
-- Only Admins can view full audit logs
CREATE POLICY admin_view_audit_logs ON audit_logs
    FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
