import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
import sys

EMAIL_ADDRESS = os.getenv('GMAIL_ADDRESS')
EMAIL_PASSWORD = os.getenv('GMAIL_PASSWORD')

def send_email(to_address, subject, body):
    msg = MIMEMultipart()
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = to_address
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.set_debuglevel(0)
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)
            print("Email sent successfully.")
    except smtplib.SMTPAuthenticationError as e:
        print(f"Authentication error: {e}")
    except Exception as e:
        print(f"Failed to send email: {e}")

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Usage: python send_email.py <to_address> <subject> <body>")
        sys.exit(1)
    
    to_address = sys.argv[1]
    subject = sys.argv[2]
    body = sys.argv[3]

    send_email(to_address, subject, body)
