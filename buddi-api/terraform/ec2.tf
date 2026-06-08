locals {
  user_data = <<EOF
#!/bin/bash
set -e
exec > /var/log/user-data.log 2>&1

# 1. EIP 자동 연결
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
INSTANCE_ID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id)
aws ec2 associate-address \
  --region ${var.aws_region} \
  --instance-id $INSTANCE_ID \
  --allocation-id ${var.eip_allocation_id} \
  --allow-reassociation

# 2. 패키지 설치
yum install -y java-17-amazon-corretto nginx python3-certbot-nginx

# 3. S3에서 jar 및 환경변수 파일 다운로드
mkdir -p /app
aws s3 cp s3://${var.s3_bucket_name}/app.jar /app/app.jar
aws s3 cp s3://${var.s3_bucket_name}/app.env /app/app.env
aws s3 cp s3://${var.s3_bucket_name}/firebase-service-account.json /app/firebase-service-account.json
chmod 600 /app/app.env /app/firebase-service-account.json

# 4. Spring Boot systemd 서비스 등록 및 실행
cat > /etc/systemd/system/buddi-api.service << 'SERVICE'
[Unit]
Description=Buddi API Spring Boot
After=network.target

[Service]
EnvironmentFile=/app/app.env
ExecStart=/usr/bin/java -jar /app/app.jar --spring.profiles.active=prod
StandardOutput=append:/app/app.log
StandardError=append:/app/app.log
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable buddi-api
systemctl start buddi-api

# 5. nginx 설정 (80만 먼저 - certbot 인증용)
cat > /etc/nginx/conf.d/moamong.conf << 'NGINX'
server {
    listen 80;
    server_name api.moamong.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

# 6. nginx 시작 후 SSL 인증서 발급 (certbot이 443 설정 자동 추가)
systemctl start nginx
systemctl enable nginx
certbot --nginx -d api.moamong.com --non-interactive --agree-tos -m wminsoo01@gmail.com --redirect

# 7. nginx 재시작
systemctl restart nginx

# 8. 인증서 자동 갱신 크론 등록
mkdir -p /etc/cron.d
echo "0 3 * * * root certbot renew --quiet && systemctl reload nginx" > /etc/cron.d/certbot-renew

# 9. CloudWatch Agent 설치 및 설정
yum install -y amazon-cloudwatch-agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c ssm:/moamong/cloudwatch-agent-config

echo "배포 완료: $(date)"
EOF
}

resource "aws_launch_template" "moamong" {
  name_prefix   = "moamong-"
  image_id      = var.ami_id
  instance_type = var.instance_type
  key_name      = var.key_name

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [var.security_group_id]
    subnet_id                   = var.subnet_id
  }

  user_data = base64encode(local.user_data)
}

resource "aws_autoscaling_group" "moamong" {
  name             = "moamong-asg"
  min_size         = 1
  max_size         = 1
  desired_capacity = 1

  launch_template {
    id      = aws_launch_template.moamong.id
    version = "$Latest"
  }

  vpc_zone_identifier       = [var.subnet_id]
  health_check_type         = "EC2"
  health_check_grace_period = 180

  tag {
    key                 = "Name"
    value               = "moamong-api"
    propagate_at_launch = true
  }
}
