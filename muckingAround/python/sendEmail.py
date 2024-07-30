import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os

EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')

COUNTER_FILE = 'email_counter.txt'

def read_counter():
    """Reads the email sent counter from the file."""
    if not os.path.exists(COUNTER_FILE):
        with open(COUNTER_FILE, 'w') as f:
            f.write('0')
    with open(COUNTER_FILE, 'r') as f:
        return int(f.read())

def update_counter(count):
    """Updates the email sent counter in the file."""
    with open(COUNTER_FILE, 'w') as f:
        f.write(str(count))

def send_email(to_address, subject, body):
    msg = MIMEMultipart()
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = to_address
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.set_debuglevel(0)  # Enable debug output for troubleshooting
            server.starttls()  # Upgrade the connection to secure
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)
            print("Email sent successfully.")
            count = read_counter() + 1
            update_counter(count)
            print(f"Email has been sent {count} times.")
    except smtplib.SMTPAuthenticationError as e:
        print(f"Authentication error: {e}")
    except Exception as e:
        print(f"Failed to send email: {e}")

def generate_daily_report():
    report_date = datetime.now().strftime('%Y-%m-%d')
    report_content = f"Daily Report for {report_date}\n\n"
    report_content += "Here are the details of today's report:\n"
    report_content += "Nothing yet\n"
    return report_content

def main():
    recipient_email = '1helpfulinformation1@gmail.com'  # Replace with recipient email
    report_content = generate_daily_report()
    send_email(recipient_email, 'Daily Report', report_content)
    print(f"Email sent successfully on {datetime.now()}")

if __name__ == '__main__':
    main()
