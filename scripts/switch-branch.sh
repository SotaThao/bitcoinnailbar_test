#!/bin/bash

# ========================================
# SWITCH SUPABASE BRANCH
# ========================================
# Quick switch between staging and main
# ========================================

set -e

BRANCH=$1

if [ -z "$BRANCH" ]; then
    echo "Usage: ./scripts/switch-branch.sh [staging|main]"
    echo ""
    echo "Current branches:"
    supabase branches list
    exit 1
fi

if [ "$BRANCH" != "staging" ] && [ "$BRANCH" != "main" ]; then
    echo "❌ Error: Branch must be 'staging' or 'main'"
    exit 1
fi

echo "🔄 Switching to $BRANCH branch..."
supabase branches switch $BRANCH

echo ""
echo "✅ Switched to $BRANCH"
echo ""
echo "📋 Branch info:"
supabase branches get $BRANCH
