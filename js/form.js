// -------Form  validation index.html and contact.html
document.addEventListener("DOMContentLoaded", function () {
  const newsletterForm = document.getElementById("newsletterForm");
  const contactForm = document.getElementById("contactForm");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (event) {
      validateForm(event, "newsletter");
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      validateForm(event, "contact");
    });
  }
  //this funtion validate form inputs and display error message
  function validateForm(event, formType) {
    event.preventDefault();
    let hasError = false;
    //select inputfields name based on formtype
    const nameInput = formType === "newsletter" ? "name" : "contactName";
    const emailInput = formType === "newsletter" ? "email" : "contactEmail";
    const name = event.target.querySelector(`#${nameInput}`).value;
    const email = event.target.querySelector(`#${emailInput}`).value;

    // This validate name for both(more then 5 characters)
    if (name.length <= 5) {
      event.target.querySelector(`#${nameInput}Error`).innerText =
        "Name must be more than 5 characters long.";
      hasError = true;
    } else {
      event.target.querySelector(`#${nameInput}Error`).innerText = "";
    }

    // Validate email for both(pattern)
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      event.target.querySelector(`#${emailInput}Error`).innerText =
        "Please provide a valid email address.";
      hasError = true;
    } else {
      event.target.querySelector(`#${emailInput}Error`).innerText = "";
    }

    // Validation subject and message for contact form (more then 15 characters  and more then 25 characters)
    if (formType === "contact") {
      const subject = event.target.querySelector("#contactSubject").value;
      const message = event.target.querySelector("#contactMessage").value;

      if (subject.length <= 15) {
        event.target.querySelector("#contactSubjectError").innerText =
          "Subject must be more than 15 characters long.";
        hasError = true;
      } else {
        event.target.querySelector("#contactSubjectError").innerText = "";
      }

      if (message.length <= 25) {
        event.target.querySelector("#contactMessageError").innerText =
          "Message must be more than 25 characters long.";
        hasError = true;
      } else {
        event.target.querySelector("#contactMessageError").innerText = "";
      }

      // If no error, post data to WordPress
      if (!hasError) {
        postContactFormDataToWordPress(name, email, subject, message);
      }
    } else if (formType === "newsletter" && !hasError) {
      window.location.href = "/html/newsletter-thank-you.html";
    }
  }
});

//-----Submitting the contact form data to wordpress backend. 
//Sends contact form data that is gathered from the form to a WordPress endpoint via a POST request(backend), if successful submission, redirects the user to a thank-you page.
function postContactFormDataToWordPress(name, email, subject, message) {
  const errorSubmit = document.getElementById('errorMessageSubmit');

  // Object with the form data
  const formData = {
    contactname: name,
    contactemail: email,
    contactsubject: subject,
    contactmessage: message,
  };
  const proxyUrl = "https://noroffcors.onrender.com/";
  const targetUrl =
    "https://james-smith.cmsbackendsolutions.com/wp-json/james-smith/v1/contact/";

  // Post request to the targetUrl with the formData object
  fetch(proxyUrl + targetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        window.location.href = "/html/contact-thank-you.html";
      } else {
        errorSubmit.innerText = "Your submission could not be processed due to a validation error. Please check your entries and try again.";
      console.error("Server responded with a submission error:", data.error);
      }
    })
    .catch((error) => {
      errorSubmit.innerText = "I encountered a problem connecting to the server. Please check your internet connection and try again.";
    console.error("Network or fetch error:", error);
    });
}

//Select all inputs and make so Keyboard enter submit the form. but in texarea its not working and i decided not ovridding the texerea default behaveior.
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
          e.preventDefault();

          this.form.dispatchEvent(new Event('submit'));
      }
  });
});





//Old code for Form validation only.
// // Form validation for index.html and contact.html
// document.addEventListener("DOMContentLoaded", function () {
//   const newsletterForm = document.getElementById("newsletterForm");
//   const contactForm = document.getElementById("contactForm");

//   if (newsletterForm) {
//     newsletterForm.addEventListener("submit", function (event) {
//       validateForm(event, "newsletter");
//     });
//   }

//   if (contactForm) {
//     contactForm.addEventListener("submit", function (event) {
//       validateForm(event, "contact");
//     });
//   }
//   // this function prevent if there are missing characters or invalid email. it creates text for each input/texerea, at the end it redriect the user if everything in the form is validateForm.
//   function validateForm(event, formType) {
//     let hasError = false;

//     const nameInput = formType === "newsletter" ? "name" : "contactName";
//     const emailInput = formType === "newsletter" ? "email" : "contactEmail";
//     const name = event.target.querySelector(`#${nameInput}`).value;
//     const email = event.target.querySelector(`#${emailInput}`).value;

//     // Validate name for both
//     if (name.length <= 5) {
//       event.target.querySelector(`#${nameInput}Error`).innerText =
//         "Name must be more than 5 characters long.";
//       hasError = true;
//     } else {
//       event.target.querySelector(`#${nameInput}Error`).innerText = "";
//     }

//     // Validate email for both
//     const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     if (!emailPattern.test(email)) {
//       event.target.querySelector(`#${emailInput}Error`).innerText =
//         "Please provide a valid email address.";
//       hasError = true;
//     } else {
//       event.target.querySelector(`#${emailInput}Error`).innerText = "";
//     }

//     // Validation subject and message for contact
//     if (formType === "contact") {
//       const subject = event.target.querySelector("#contactSubject").value;
//       const message = event.target.querySelector("#contactMessage").value;

//       if (subject.length <= 15) {
//         event.target.querySelector("#contactSubjectError").innerText =
//           "Subject must be more than 15 characters long.";
//         hasError = true;
//       } else {
//         event.target.querySelector("#contactSubjectError").innerText = "";
//       }

//       if (message.length <= 25) {
//         event.target.querySelector("#contactMessageError").innerText =
//           "Message must be more than 25 characters long.";
//         hasError = true;
//       } else {
//         event.target.querySelector("#contactMessageError").innerText = "";
//       }
//     }

//     // Validation and redirection for both forms
//     if (hasError) {
//       event.preventDefault();
//     } else {
//       if (formType === "newsletter") {
//         window.location.href = "/html/newsletter-thank-you.html";
//       } else if (formType === "contact") {
//         window.location.href = "/html/contact-thank-you.html";
//       }
//       event.preventDefault();
//     }
//   }
// });
