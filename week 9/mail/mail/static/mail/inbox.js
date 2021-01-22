document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function archive_email(email_id) {
    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
    }).then( () => load_mailbox("inbox"));

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  
    // Request for emails from the specified mailbox
    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {
            emails.forEach(email => {
                const div = document.createElement("div");
                div.innerHTML = `
                    <div style="color: grey;"></div>
                    <span>${email.sender}</span>
                    <span>${email.subject}</span> 
                    <span style="float: right;">${email.timestamp}</span>`
                div.className = "mailbox-email"
                if (email.read) {
                    div.style.fontWeight = 'normal';
                }
                else if (!email.read){
                    div.style.fontWeight = 'bold';
                }

                // display the content of email
                div.addEventListener('click', function() {
                    fetch(`/emails/${email.id}`)
                        .then(response => response.json())
                        .then(email => {
                            // set email to read
                            if (!email.read) {
                                fetch(`/emails/${email.id}`, {
                                    method: 'PUT',
                                    body: JSON.stringify({
                                        read: true
                                    })
                                })
                            }
                            // load details on page
                            loadEmail(email, mailbox)
                        });
                })

                // Change color of email if opened
                div.style.backgroundColor = "white";
                if (email.read) {
                  div.style.backgroundColor = "silver";
                }
                document.querySelector("#emails-view").append(div)
            })
        });

};

function loadEmail(emailData, fromMailbox) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  const subjectTitle = document.createElement("div");
  subjectTitle.innerHTML = emailData.subject;
  subjectTitle.className = 'subject-title';

  const detailedInfo = document.createElement("div");
  detailedInfo.innerHTML = `
      <div>
          <span>From: </span>${emailData.sender}
          <span style="float: right">${emailData.timestamp}</span>
      </div>
      <div>
          <span>To: </span>${emailData.recipients.join()}
      </div>
      <div>
          <span>Subject: </span>${emailData.subject}
      </div>
  `
  const senderSection = document.createElement("div");
  senderSection.innerHTML = `<span>From: </span>${emailData.sender}`;

  const recipientSection = document.createElement("div");
  recipientSection.innerHTML = `<span>To: </span>${emailData.recipients.join()}`;

  const subjectSection = document.createElement("div");
  subjectSection.innerHTML = `<span>Subject: </span>${emailData.subject}`;

  const timestampSection = document.createElement("div");
  timestampSection.innerHTML = `<span>Timestamp: </span>${emailData.timestamp}`;

  const bodySection = document.createElement("div");
  bodySection.innerText = emailData.body;

  const replyButton = document.createElement("button");
  replyButton.innerHTML = "Reply";
  replyButton.addEventListener('click', function() {
        compose_email();
        document.querySelector('#compose-recipients').value = emailData.sender;
        document.querySelector('#compose-subject').value= emailData.subject;
        document.querySelector('#compose-body').value  = `On ${emailData.timestamp} <${emailData.sender}> wrote:\n${emailData.body}\n`;
        
  });

  // Load the components to be displayed
  document.querySelector('#email-view').innerHTML = "";
  document.querySelector('#email-view').append(subjectTitle)
  document.querySelector('#email-view').append(detailedInfo)
  document.querySelector('#email-view').append(replyButton)

  // Add archive button
  if (fromMailbox === "inbox") {
      const archiveButton = document.createElement("button");
      archiveButton.innerHTML = "Archive"
      archiveButton.addEventListener('click', function() {
          fetch(`/emails/${emailData.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: true
              })
          })
        load_mailbox("inbox")
            
      })
      document.querySelector('#email-view').append(archiveButton)
  } else if (fromMailbox === "archive") {
      const unarchiveButton = document.createElement("button");
      unarchiveButton.innerHTML = "Move to inbox"
      unarchiveButton.addEventListener('click', function() {
          fetch(`/emails/${emailData.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: false
                })
          })
        load_mailbox("inbox")
          
      })
      document.querySelector('#email-view').append(unarchiveButton)
  }
  document.querySelector('#email-view').append(bodySection)
}

function send_email(){
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
        })
    })
    .then(response => response.json())
        .then(result => {
            if ("message" in result) {
                // The email was sent successfully!
                load_mailbox('sent');
            }
            if ("error" in result) {
                // There was an error in sending the email
                console.log("error" in result);            
            }
        })
        .catch(error => {
            console.log(error);
        });
    return false;
}