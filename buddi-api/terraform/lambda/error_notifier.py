import json
import boto3
import base64
import gzip
import os

def lambda_handler(event, context):
    log_data = base64.b64decode(event['awslogs']['data'])
    log_data = gzip.decompress(log_data)
    log_json = json.loads(log_data)

    log_group = log_json['logGroup']
    log_stream = log_json['logStream']
    log_events = log_json['logEvents']

    messages = [e['message'] for e in log_events]
    body = '\n'.join(messages)

    sns = boto3.client('sns')
    sns.publish(
        TopicArn=os.environ['SNS_TOPIC_ARN'],
        Subject='[moamong] ERROR 로그 발생',
        Message=f"Log Group: {log_group}\nLog Stream: {log_stream}\n\n{body}"
    )
