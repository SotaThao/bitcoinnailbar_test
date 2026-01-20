#!/bin/bash

# ========================================
# DEPLOY TO STAGING BRANCH
# ========================================
# This script deploys Edge Functions to 
# Supabase staging branch
# ========================================

set -e  # Exit on error

echo "🚀 Deploying to Supabase Staging Branch..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Error: Not logged in to Supabase"
    echo "Login with: supabase login"
    exit 1
fi

# Get staging branch info
echo "📋 Getting staging branch info..."
STAGING_INFO=$(supabase branches get staging --json 2>/dev/null)

if [ -z "$STAGING_INFO" ]; then
    echo "❌ Error: Staging branch not found"
    echo "Create it with: supabase branches create staging"
    exit 1
fi

STAGING_REF=$(echo $STAGING_INFO | jq -r '.project_ref')
echo "✅ Staging branch found: $STAGING_REF"
echo ""

# Confirm deployment
echo "⚠️  This will deploy Edge Functions to STAGING environment"
echo "   Project Ref: $STAGING_REF"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

# Deploy functions
echo ""
echo "📦 Deploying Edge Functions..."
supabase functions deploy --project-ref $STAGING_REF

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🔗 Test your staging environment at:"
echo "   https://$STAGING_REF.supabase.co/functions/v1/make-server-84f9c112/health"
echo ""
