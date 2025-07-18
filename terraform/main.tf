
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_default_vpc" "default" {
  tags = {
    Name = "Default VPC"
  }
}

resource "aws_security_group" "web_sg" {
  name_prefix = "medusa-demo-"
  vpc_id      = aws_default_vpc.default.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 9000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "medusa-demo-sg"
  }
}

resource "aws_instance" "medusa_demo" {
  ami           = "ami-0230bd60aa48260c6" # Amazon Linux 2023
  instance_type = var.instance_type
  key_name      = var.key_name

  vpc_security_group_ids = [aws_security_group.web_sg.id]

  root_block_device {
    volume_type = "gp3"
    volume_size = 20
    encrypted   = true
  }

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
    
    npm install -g yarn
    
    yum install -y postgresql15-server postgresql15
    postgresql-setup --initdb
    systemctl enable postgresql
    systemctl start postgresql
    
    yum install -y redis
    systemctl enable redis
    systemctl start redis
    
    yum install -y nginx
    systemctl enable nginx
    
    npm install -g pm2
    
    useradd -m -s /bin/bash app
    
    sudo -u postgres createdb medusa_demo
    sudo -u postgres psql -c "CREATE USER medusa WITH PASSWORD 'medusa123';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE medusa_demo TO medusa;"
  EOF

  tags = {
    Name = "medusa-demo-server"
  }
}

resource "aws_eip" "medusa_demo_eip" {
  instance = aws_instance.medusa_demo.id
  domain   = "vpc"

  tags = {
    Name = "medusa-demo-eip"
  }
}

output "instance_ip" {
  value = aws_eip.medusa_demo_eip.public_ip
}

output "instance_dns" {
  value = aws_instance.medusa_demo.public_dns
}

output "ssh_command" {
  value = "ssh -i ~/.ssh/${var.key_name}.pem ec2-user@${aws_eip.medusa_demo_eip.public_ip}"
}
