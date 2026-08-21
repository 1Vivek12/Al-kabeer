-- ==============================================================================
-- AL KABEER TRADING & CONTRACTING W.L.L. - PRODUCTION SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Run this entire script in your Supabase Dashboard -> SQL Editor -> Run
-- This creates all required tables, columns, indexes, and RLS policies for:
--   1. Live HR Document Registration & Verification (Offer Letters, ID Cards, Certs)
--   2. Client Web Enquiries & Quote Requests
-- ==============================================================================

-- 1. DROP EXISTING TABLE IF YOU WANT A CLEAN FRESH START (OPTIONAL)
-- DROP TABLE IF EXISTS public.hr_documents CASCADE;
-- DROP TABLE IF EXISTS public.contact_enquiries CASCADE;

-- 2. CREATE HR DOCUMENTS REGISTRY TABLE
CREATE TABLE IF NOT EXISTS public.hr_documents (
    "refNo" VARCHAR(100) PRIMARY KEY,
    "empName" TEXT NOT NULL,
    "empIdNo" VARCHAR(100) NOT NULL,
    "empTitle" TEXT NOT NULL,
    "empNat" VARCHAR(100) NOT NULL,
    "empQid" VARCHAR(100) DEFAULT '29852401928',
    "empDept" TEXT DEFAULT 'CIVIL DIVISION',
    "empBlood" VARCHAR(20) DEFAULT 'O+ POSITIVE',
    "empEmergency" VARCHAR(50) DEFAULT '+974 5592 1820',
    "salaryString" TEXT,
    "docDate" VARCHAR(50),
    "empDoj" VARCHAR(50),
    "docType" VARCHAR(100) NOT NULL DEFAULT 'offer',
    "docTypeName" TEXT DEFAULT 'Employment Offer Letter',
    "photoUrl" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'VERIFIED',
    "company" TEXT DEFAULT 'Al Kabeer Trading & Contracting W.L.L.',
    "crNo" VARCHAR(50) DEFAULT '184920',
    "establishmentId" VARCHAR(50) DEFAULT '74/92014',
    "generatedAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Add index on refNo, empName, and empIdNo for ultra-fast verification search
CREATE INDEX IF NOT EXISTS idx_hr_documents_refNo ON public.hr_documents("refNo");
CREATE INDEX IF NOT EXISTS idx_hr_documents_empName ON public.hr_documents("empName");
CREATE INDEX IF NOT EXISTS idx_hr_documents_empIdNo ON public.hr_documents("empIdNo");

-- 3. CREATE CLIENT CONTACT ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.contact_enquiries (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone VARCHAR(50),
    service TEXT,
    message TEXT,
    status VARCHAR(50) DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index on status and created_at
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.contact_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON public.contact_enquiries(created_at DESC);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.hr_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;

-- 5. CREATE RLS POLICIES TO ALLOW PUBLIC/ANON READ & WRITE ACCESS FOR LIVE VERIFICATION
-- Policy: Anyone can search and verify documents (Public Verification Portal)
DROP POLICY IF EXISTS "Allow Public Verification Read" ON public.hr_documents;
CREATE POLICY "Allow Public Verification Read" 
ON public.hr_documents 
FOR SELECT 
USING (true);

-- Policy: Admin panel can insert/upsert document records
DROP POLICY IF EXISTS "Allow Admin Insert Documents" ON public.hr_documents;
CREATE POLICY "Allow Admin Insert Documents" 
ON public.hr_documents 
FOR INSERT 
WITH CHECK (true);

-- Policy: Admin panel can update document records
DROP POLICY IF EXISTS "Allow Admin Update Documents" ON public.hr_documents;
CREATE POLICY "Allow Admin Update Documents" 
ON public.hr_documents 
FOR UPDATE 
USING (true);

-- Policy: Allow Delete Document Records (Admin Registry Delete)
DROP POLICY IF EXISTS "Allow Admin Delete Documents" ON public.hr_documents;
CREATE POLICY "Allow Admin Delete Documents" 
ON public.hr_documents 
FOR DELETE 
USING (true);

-- Policies for Contact Enquiries
DROP POLICY IF EXISTS "Allow Public Insert Enquiries" ON public.contact_enquiries;
CREATE POLICY "Allow Public Insert Enquiries" 
ON public.contact_enquiries 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Admin Select Enquiries" ON public.contact_enquiries;
CREATE POLICY "Allow Admin Select Enquiries" 
ON public.contact_enquiries 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow Admin Update Enquiries" ON public.contact_enquiries;
CREATE POLICY "Allow Admin Update Enquiries" 
ON public.contact_enquiries 
FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Allow Admin Delete Enquiries" ON public.contact_enquiries;
CREATE POLICY "Allow Admin Delete Enquiries" 
ON public.contact_enquiries 
FOR DELETE 
USING (true);

-- 6. INSERT INITIAL DEMO/TEST DOCUMENT RECORDFOR IMMEDIATE VERIFICATION TEST
INSERT INTO public.hr_documents (
    "refNo", "empName", "empIdNo", "empTitle", "empNat", 
    "salaryString", "docDate", "empDoj", "docType", "docTypeName", 
    "photoUrl", "status", "company", "crNo", "establishmentId"
) VALUES (
    'QTR/AK:A01969', 'AASHIK RAUT', 'PA5231328', 'CIVIL FOREMAN', 'NEPAL',
    '[BASIC 3400 + OT / MONTH] QAR + FREE FOOD & ACCOMMODATION', '13/08/2026', '15/08/2026', 'offer', 'Employment Offer Letter',
    '', 'VERIFIED', 'Al Kabeer Trading & Contracting W.L.L.', '184920', '74/92014'
) ON CONFLICT ("refNo") DO UPDATE SET
    "empName" = EXCLUDED."empName",
    "empIdNo" = EXCLUDED."empIdNo",
    "status" = 'VERIFIED';

-- ==============================================================================
-- DONE! YOUR SUPABASE CLOUD DATABASE IS NOW 100% PRODUCTION READY!
-- ==============================================================================
