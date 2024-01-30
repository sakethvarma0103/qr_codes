const fs = require('fs');
const csv = require('csv-parser');
const mandrill = require('mandrill-api');

const mandrillClient = new mandrill.Mandrill('md-mhM6LLfZ1EdrAMP_ZQbQVw');
const templateName = "QR2";  // Replace with your template name

// Read recipients from CSV file
const recipients = [];
fs.createReadStream('qr_hash.csv')
  .pipe(csv({
    headers: ["Record ID","First Name","Last Name","Mobile Phone Number","College","Email","Hash"],
  }))
  .on('data', (row) => {
    // Check if the email is not empty and is a valid email address
    if (row.Email) {
      recipients.push({
        email: row.Email,
        name: `${row['First Name']} ${row['Last Name']}`,
        type: 'to',
        merge_vars: [
          { name: 'FNAME', content: row['First Name']},
           { name: 'qr_code', content: generateQRCodeUrl(row['Hash'])
         },
          // Add more merge variables as needed
        ],
      });
    }
  })
  .on('end', () => {
    // Call the function to send emails after reading recipients from CSV
    sendEmails(recipients);
  });

// Function to send emails to all recipients
function sendEmails(recipients) {
  recipients.forEach(sendEmail);
}

// Function to send the email
function sendEmail(recipient) {
  if (recipient.merge_vars.length === 0) {
    console.error(`Error sending email to ${recipient.email}: No merge variables available`);
    return;
  }

  const emailMessage = {
    to: [{ email: recipient.email, name: recipient.name }],
    global_merge_vars: recipient.merge_vars,
  };

  mandrillClient.messages.sendTemplate({
    template_name: templateName,
    template_content: [],
    message: emailMessage,
  }, function (result) {
    if (result && result.length > 0 && result[0].status) {
      console.log(`Email sent to ${recipient.email}: ${result[0].status}`);
    } else {
      console.error(`Error sending email to ${recipient.email}: No status information available`);
    }
  }, function (error) {
    console.error(`Error sending email to ${recipient.email}: ${error.message}`);
  });
}
function generateQRCodeUrl(hash) {
    // Assuming you have a function to generate QR code URLs based on hash
    return `https://sakethvarma0103.github.io/qr_codes/qr_codes/${hash}_qr.png`;
  }