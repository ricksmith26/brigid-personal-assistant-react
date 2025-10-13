.PHONY: help build deploy infrastructure-init infrastructure-plan infrastructure-apply infrastructure-destroy invalidate-cache

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build the React application
	npm run build

deploy: build ## Build and deploy to AWS (requires infrastructure to be set up)
	@./scripts/deploy.sh

infrastructure-init: ## Initialize Terraform
	cd terraform && terraform init

infrastructure-plan: ## Plan Terraform infrastructure changes
	cd terraform && terraform plan

infrastructure-apply: ## Apply Terraform infrastructure changes
	cd terraform && terraform apply

infrastructure-destroy: ## Destroy all Terraform infrastructure (WARNING: irreversible)
	cd terraform && terraform destroy

infrastructure-output: ## Show Terraform outputs
	cd terraform && terraform output

invalidate-cache: ## Invalidate CloudFront cache
	@cd terraform && \
	aws cloudfront create-invalidation \
		--distribution-id $$(terraform output -raw cloudfront_distribution_id) \
		--paths "/*"

sync-to-s3: build ## Upload build files to S3
	@cd terraform && \
	aws s3 sync ../dist/ s3://$$(terraform output -raw s3_bucket_name)/ \
		--delete \
		--cache-control "public, max-age=31536000, immutable" \
		--exclude "index.html" && \
	aws s3 cp ../dist/index.html s3://$$(terraform output -raw s3_bucket_name)/index.html \
		--cache-control "public, max-age=0, must-revalidate"

list-s3: ## List files in S3 bucket
	@cd terraform && aws s3 ls s3://$$(terraform output -raw s3_bucket_name)/ --recursive

cloudfront-status: ## Check CloudFront distribution status
	@cd terraform && \
	aws cloudfront get-distribution \
		--id $$(terraform output -raw cloudfront_distribution_id) \
		--query 'Distribution.Status' \
		--output text

check-website: ## Check if website is accessible
	@cd terraform && \
	curl -I https://$$(terraform output -raw domain_name) || echo "Website not accessible yet"

setup: infrastructure-init infrastructure-apply ## Complete initial setup (init + apply infrastructure)
	@echo ""
	@echo "✅ Infrastructure setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "1. Configure GitHub Actions secrets"
	@echo "2. Run 'make deploy' to deploy the application"

clean: ## Clean build artifacts
	rm -rf dist/
	rm -rf node_modules/.cache/

dev: ## Start development server
	npm run dev
