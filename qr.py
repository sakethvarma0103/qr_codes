import qrcode
import hashlib
import csv
import json

# Assuming you have a CSV file named 'testr.csv' with columns: First Name, Email, Mobile Phone Number
csv_file = 'testr.csv'
output_csv_file = 'testr_with_hashes.csv'  # New CSV file with added hash column

# Function to create a unique hash for each student
def generate_hash(name, email, phone):
    data = f'{name}{email}{phone}'
    hashed_data = hashlib.md5(data.encode()).hexdigest()
    return hashed_data

# Function to generate QR code for each student with embedded details
def generate_qr_code_with_details(name, email, phone, filename):
    student_details = {
        'Name': name,
        'Email': email,
        'Phone': phone
    }
    details_json = json.dumps(student_details)

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(details_json)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(filename)

# Open the CSV file and iterate through each row to generate QR code and add hash to CSV
with open(csv_file, 'r') as input_file, open(output_csv_file, 'w', newline='') as output_file:
    reader = csv.DictReader(input_file)
    fieldnames = reader.fieldnames + ['Hash']  # Add 'Hash' as a new column

    writer = csv.DictWriter(output_file, fieldnames=fieldnames)
    writer.writeheader()
    c=0
    for row in reader:
        name = row['First Name']
        email = row['Email']
        phone = row['Mobile Phone Number']

        # Generate a unique hash for each student
        unique_hash = generate_hash(name, email, phone)

        # Create a QR code with embedded student details
        qr_code_filename = f'qr_codes/{unique_hash}_qr.png'
        generate_qr_code_with_details(name, email, phone, qr_code_filename)

        # Add the hash to the CSV file
        row['Hash'] = unique_hash
        writer.writerow(row)

        c+=1

print(c,' QR Codes and Hashes generated successfully.')