# Deployment Guide

This guide walks you through deploying the Brigid Personal Assistant React app to AWS with the custom domain `https://brigid-personal-assistant.com`.

## Quick Start

### 1. Deploy Infrastructure (One-time setup)

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

This creates:
- S3 bucket for hosting
- CloudFront CDN distribution
- SSL certificate via ACM
- Route53 DNS records

**Time**: 20-45 minutes (mostly waiting for SSL certificate validation)

### 2. Configure GitHub Actions

#### A. Create IAM Role for GitHub Actions

Replace `YOUR_ACCOUNT_ID` and `YOUR_GITHUB_USERNAME` with your values:

```bash
# Get your AWS account ID
aws sts get-caller-identity --query Account --output text

# Create trust policy
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::054037114564:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:ricksmith26/brigid-personal-assistant-react:*"
        }
      }
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name GitHubActionsBrigidAssistant \
  --assume-role-policy-document file://trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name GitHubActionsBrigidAssistant \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-role-policy \
  --role-name GitHubActionsBrigidAssistant \
  --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess
```

#### B. Add GitHub Secrets

Go to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Add these 3 secrets:

1. **AWS_ROLE_ARN**
   ```bash
   echo "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/GitHubActionsBrigidAssistant"
   ```

2. **S3_BUCKET_NAME**
   ```bash
   cd terraform && terraform output -raw s3_bucket_name
   ```

3. **CLOUDFRONT_DISTRIBUTION_ID**
   ```bash
   cd terraform && terraform output -raw cloudfront_distribution_id
   ```

### 3. Deploy Application

#### Option A: Automatic (via GitHub Actions)
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

#### Option B: Manual (via script)
```bash
./scripts/deploy.sh
```

## Architecture Overview

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────────────────┐
│  Route53 DNS                        │
│  brigid-personal-assistant.com      │
│  → CloudFront Distribution          │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  CloudFront CDN                     │
│  - Global edge locations            │
│  - SSL/TLS (ACM Certificate)        │
│  - Caching                          │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  S3 Bucket                          │
│  - Static website hosting           │
│  - React build files                │
└─────────────────────────────────────┘
```

## File Structure

```
.
├── .github/
│   └── workflows/
│       ├── deploy.yml       # App deployment workflow
│       └── terraform.yml    # Infrastructure workflow
├── terraform/
│   ├── main.tf             # Main infrastructure config
│   ├── variables.tf        # Input variables
│   ├── outputs.tf          # Output values
│   ├── .gitignore          # Terraform gitignore
│   └── README.md           # Detailed Terraform docs
├── scripts/
│   └── deploy.sh           # Manual deployment script
└── DEPLOYMENT.md           # This file
```

## Common Tasks

### View Deployment Status
```bash
# Check GitHub Actions
# Go to: https://github.com/YOUR_USERNAME/brigid-personal-assistant-react/actions

# Check CloudFront distribution
cd terraform
aws cloudfront get-distribution \
  --id $(terraform output -raw cloudfront_distribution_id)
```

### Manual Cache Invalidation
```bash
cd terraform
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw cloudfront_distribution_id) \
  --paths "/*"
```

### View S3 Contents
```bash
cd terraform
aws s3 ls s3://$(terraform output -raw s3_bucket_name)/
```

### Update Infrastructure
```bash
cd terraform
# Edit terraform files as needed
terraform plan
terraform apply
```

## Troubleshooting

### Issue: Certificate validation stuck
**Solution**:
- Check nameservers at domain registrar match Route53
- DNS propagation can take up to 48 hours
- Verify Route53 validation records exist

### Issue: 403 errors on website
**Solution**:
- Verify files uploaded to S3
- Check S3 bucket policy
- CloudFront distribution may still be deploying (15-20 min)

### Issue: Changes not appearing
**Solution**:
- CloudFront caches content
- Create invalidation: `aws cloudfront create-invalidation --distribution-id XXX --paths "/*"`
- Wait 3-5 minutes for invalidation

### Issue: GitHub Actions deployment fails
**Solution**:
- Verify IAM role ARN in secrets
- Check IAM role has S3 and CloudFront permissions
- Review GitHub Actions logs for specific error

## Environment Variables

If your React app needs environment variables during build:

1. **For GitHub Actions**: Add to [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
   ```yaml
   - name: Build application
     run: npm run build
     env:
       VITE_API_URL: ${{ secrets.VITE_API_URL }}
   ```

2. **For Local Builds**: Use [.env](.env) file (already in .gitignore)

## Costs

Estimated monthly AWS costs (assuming low traffic):

| Service | Cost |
|---------|------|
| S3 Storage (1GB) | ~$0.023 |
| S3 Requests (10k) | ~$0.005 |
| CloudFront (10GB transfer) | ~$0.85 |
| CloudFront Requests (100k) | ~$0.10 |
| Route53 Hosted Zone | $0.50 |
| ACM Certificate | Free |
| **Total** | **~$1.50/month** |

For higher traffic, costs scale with usage.

## Security Checklist

- [ ] S3 bucket is private (public access blocked)
- [ ] CloudFront uses HTTPS only
- [ ] SSL certificate is valid and auto-renewing
- [ ] IAM role follows least-privilege principle
- [ ] GitHub secrets are properly configured
- [ ] No sensitive data in environment variables committed to git

## Additional Resources

- [Terraform Documentation](terraform/README.md) - Detailed infrastructure docs
- [AWS S3 Static Website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [GitHub Actions AWS](https://github.com/aws-actions/configure-aws-credentials)

## Support

For issues:
1. Check GitHub Actions logs
2. Review CloudWatch logs (if enabled)
3. Check AWS CloudTrail for API errors
4. Review Terraform state: `terraform show`
