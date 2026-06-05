locals {
  user_data = <<-EOF
    #!/bin/bash
    set -e
    exec > /var/log/user-data.log 2>&1

    # 1. EIP 자동 연결
    INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
    aws ec2 associate-address \
      --region ${var.aws_region} \
      --instance-id $INSTANCE_ID \
      --allocation-id ${var.eip_allocation_id} \
      --allow-reassociation

    # 2. Java 설치
    if ! command -v java &> /dev/null; then
      yum install -y java-17-amazon-corretto
    fi

    # 3. S3에서 jar 다운로드
    mkdir -p /app
    aws s3 cp s3://${var.s3_bucket_name}/app.jar /app/app.jar

    # 4. Spring Boot 실행
    nohup java -jar /app/app.jar \
      --spring.profiles.active=prod \
      > /app/app.log 2>&1 &

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
