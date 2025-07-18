# AWS Deployment Plan - Cost Optimized for Demo

## Current Architecture Analysis

### Backend Requirements (Medusa v2)
- Node.js 20+ runtime
- PostgreSQL database
- Redis (optional but recommended)
- File storage for uploads
- Admin interface build support
- ECPay payment integration

### Frontend Requirements (Next.js)
- Static site generation capability
- Environment variable support
- Build process for production

## Recommended AWS Architecture

### Option 1: Single EC2 Instance (Most Cost-Effective)
**Estimated Cost: $15-25/month**

- **EC2 t3.small** (2 vCPU, 2GB RAM): ~$15/month
- **EBS Storage** (20GB): ~$2/month
- **RDS PostgreSQL** (db.t3.micro): Free tier (20GB)
- **Total**: ~$17/month

**Services:**
- Single EC2 instance running both frontend and backend
- Built-in PostgreSQL or RDS free tier
- Local Redis or ElastiCache free tier
- S3 for file storage (minimal usage)

### Option 2: Separated Services (Better Performance)
**Estimated Cost: $35-50/month**

- **EC2 t3.small** for backend: ~$15/month
- **S3 + CloudFront** for frontend: ~$5/month
- **RDS PostgreSQL** (db.t3.small): ~$15/month
- **ElastiCache Redis** (cache.t3.micro): ~$10/month
- **Total**: ~$45/month

## Implementation Plan

### Phase 1: Infrastructure Setup
1. Configure AWS CLI with user credentials
2. Create VPC and security groups
3. Launch EC2 instance with Node.js environment
4. Set up PostgreSQL (RDS or local)
5. Configure domain and SSL

### Phase 2: Application Deployment
1. Clone repository to EC2
2. Install dependencies and build applications
3. Configure environment variables
4. Set up PM2 for process management
5. Configure nginx reverse proxy

### Phase 3: Testing and Optimization
1. Test ECPay integration
2. Verify Sanity CMS connectivity
3. Performance optimization
4. Cost monitoring setup

## Cost Comparison
- **Railway**: $5/month (but deployment failing)
- **AWS Option 1**: ~$17/month (reliable, full control)
- **AWS Option 2**: ~$45/month (production-ready)

## Next Steps
1. Wait for AWS credentials from user
2. Configure AWS CLI
3. Create Terraform configuration
4. Deploy and test
