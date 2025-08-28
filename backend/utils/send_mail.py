import smtplib, ssl
import os
import environ
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env(
    DEBUG=(bool, False)
)
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))


def send_Voter_ID_mail(receiver_mail, username, voter_id):
    
    port = 465  # For SSL
    smtp_server = "smtp.gmail.com"
    sender_email = "testappdjango37@gmail.com"
    receiver_email = receiver_mail
    password = env('EMAIL_PASSWORD')
    message = f"""Welcome {username},\n\nThank you for registering with us. We are excited to have you on board!\n\nBest regards!
    \n\n Your Voter ID is: {voter_id}\n\nPlease keep this Voter ID safe as it will be required for future logins and voting."""
    create_context = ssl.create_default_context()

    with smtplib.SMTP_SSL(smtp_server, port, context=create_context) as server:
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, message)
    
        

def send_otp_mail(receiver_mail, otp):
    port = 465  # For SSL
    smtp_server = "smtp.gmail.com"
    sender_email = "testappdjango37@gmail.com"
    receiver_email = receiver_mail
    password = env('EMAIL_PASSWORD')
    message = f"Your OTP is {otp}.\n\nPlease use this OTP to complete your Login.\n\OTP expires in 5 minutes.\n\n Please do not share this OTP with anyone."
    create_context = ssl.create_default_context()

    with smtplib.SMTP_SSL(smtp_server, port, context=create_context) as server:
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, message)