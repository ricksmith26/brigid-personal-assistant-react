#!/bin/bash

# Deploy script for Brigid Personal Assistant
# This script builds the React app and deploys it to S3

set -e

echo "🚀 Starting deployment process..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get Terraform outputs
echo -e "${BLUE}📋 Getting deployment configuration...${NC}"
cd terraform
S3_BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
cd ..

if [ -z "$S3_BUCKET" ] || [ -z "$DISTRIBUTION_ID" ]; then
    echo -e "${RED}❌ Error: Could not get Terraform outputs. Make sure infrastructure is deployed.${NC}"
    echo "Run 'cd terraform && terraform apply' first."
    exit 1
fi

echo -e "${GREEN}✓ S3 Bucket: $S3_BUCKET${NC}"
echo -e "${GREEN}✓ CloudFront Distribution: $DISTRIBUTION_ID${NC}"

# Build the application
echo -e "${BLUE}🔨 Building application...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: Build directory 'dist' not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed${NC}"

# Sync to S3
echo -e "${BLUE}📤 Uploading to S3...${NC}"

# Upload all files except index.html with long cache
aws s3 sync dist/ s3://$S3_BUCKET/ \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "index.html" \
    --exclude "*.map"

# Upload index.html with no-cache
aws s3 cp dist/index.html s3://$S3_BUCKET/index.html \
    --cache-control "public, max-age=0, must-revalidate"

echo -e "${GREEN}✓ Upload completed${NC}"

# Invalidate CloudFront cache
echo -e "${BLUE}🔄 Invalidating CloudFront cache...${NC}"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

echo -e "${GREEN}✓ Invalidation created: $INVALIDATION_ID${NC}"

# Print summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Deployment completed successfully! ✨${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "🌐 Website URL: ${BLUE}https://brigid-personal-assistant.com${NC}"
echo ""
echo "Note: CloudFront invalidation may take a few minutes to complete."
echo "You can check the status with:"
echo "  aws cloudfront get-invalidation --distribution-id $DISTRIBUTION_ID --id $INVALIDATION_ID"
