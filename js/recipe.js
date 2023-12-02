//---------------------  Global Variables --------------------- //

//pr0xy URL
const corsAnywhereUrl = "https://noroffcors.onrender.com/";

// Get the post_id from the query string
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("post_id");

//New DOMParser
const parser = new DOMParser();

//Error messages and loader
//Loader
const loaderSlider = document.getElementById("loaderRecipe");
const loaderSimilar = document.getElementById("loaderSimilar");
const loaderComment = document.getElementById("loaderComment");
//Error
const errorRecipeMessage = document.querySelector("#errorRecipeMessage");
const errorSimilarMessage = document.querySelector("#errorSimilarMessage");
const errorPostCommentsMessage = document.querySelector(
  "#errorPostCommentsMessage"
);
const errorCommentsMessage = document.querySelector("#errorCommentsMessage");

//Updates the 'Back to Top' link to include the current page's id, make the navigation to top work for every id..
const backToTopLink = document.getElementById("back-to-top-link");
if (backToTopLink) {
  const queryString = urlParams.toString();
  backToTopLink.href = `/html/recipe.html${
    queryString ? "?" + queryString : ""
  }#top-of-page`;
}

//--------------------- API,  RECIPE CONTENT AND SIMILARDISH CONTENT ---------------------//

// Category IDs for filtering similar dishes based on the recipes categories
const categoryIds = {
  brunch: 70,
  pastry: 68,
  dessert: 71,
  dinner: 69,
};

// Function to get the category name by ID for filtering similar dishes
function getCategoryNameById(categoryId) {
  const idToNameMap = {
    70: "brunch",
    68: "pastry",
    71: "dessert",
    69: "dinner",
  };
  return idToNameMap[categoryId] || "Unknown";
}

//---------- Fetch -------------//

//---- This function fetch a specific post by post_id
async function fetchPostById(postId) {
  try {
    const originalUrl = `https://james-smith.cmsbackendsolutions.com/wp-json/wp/v2/posts/${postId}?_embed`;
    const url = corsAnywhereUrl + originalUrl;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching post by ID:", error);

    throw error;
  }
}

//---- This function fetch with url to get similar dishes based on the category. it use categoruId to get similar dishes(category) and expludePostId removes the current post from the flow.
async function fetchSimilarDishes(categoryNames, excludePostId) {
  let allDishes = [];

  for (const categoryName of categoryNames) {
    const categoryId = categoryIds[categoryName];
    if (categoryId) {
      const url = `https://james-smith.cmsbackendsolutions.com/wp-json/wp/v2/posts?categories=${categoryId}&per_page=4&exclude=${excludePostId}`;
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const dishes = await response.json();
        allDishes = allDishes.concat(dishes);
      } catch (error) {
        console.error(
          `Error fetching dishes for category ${categoryName}:`,
          error
        );
        throw error;
      }
    }
  }

  // Make the createsimilar dishes not display two of the same dish by removing duplicates based on dish id
  const uniqueDishIds = new Set();
  const uniqueDishes = [];
  allDishes.forEach((dish) => {
    if (!uniqueDishIds.has(dish.id)) {
      uniqueDishes.push(dish);
      uniqueDishIds.add(dish.id);
    }
  });

  return uniqueDishes;
}

//---------- Create -------------//

// This function creates similar dishes elements: image, title, and notes values.
function createSimilarDishesElements(similarDishes) {
  try {
    const container = document.querySelector(".simular-container .posts");
    container.innerHTML = "";

    similarDishes.forEach((dish) => {
      // Parsing the content
      const doc = parser.parseFromString(dish.content.rendered, "text/html");

      const image = doc.querySelector("img");
      const imageUrl = image ? image.src : "";
      const imageAlt = image ? image.alt : "";

      const article = document.createElement("article");
      article.className = "post";
      article.innerHTML = `
        <a href="/html/recipe.html?post_id=${dish.id}" class="a-post box-shadow">
            <img class="img-small block" src="${imageUrl}" alt="${imageAlt}">
            <h3 class="h3-post">${dish.title.rendered}</h3>
            <div class="hover-content text-left">
            <p class="flex space-between">
            MY RATING:
            <span class="rating-value">${dish["rating-value"]}<i class="fa-solid fa-heart"></i></span>
          </p>
          <p class="flex space-between">
            DIFFICULTY: <span class="difficulty-value">${dish["difficulty-value"]}</span>
          </p>
          <p class="flex space-between">
            TIME: <span class="time-value">${dish["time-value"]}</span>
          </p>
          <p class="flex space-between">
            CATEGORY: <span class="category-value">${dish["category-value"]}</span>
          </p>
          <p class="flex space-between">
            TYPE: <span class="type-value">${dish["type-value"]}</span>
          </p>
          <p class="flex space-between">
            ORIGIN: <span class="origin-value">${dish["origin-value"]}</span>
          </p>
            </div>
        </a>
      `;
      container.appendChild(article);
    });
  } catch (error) {
    console.error("Error displaying similar dishes:", error);
    errorSimilarMessage.textContent =
      "Looks like my side dish recommendations are taking a little longer to simmer! While I'm sort that out, please enjoy the main recipe. Swing by a bit later for those extra tasty suggestions!";
  }
}

// Function to create recipe elements with post data. title, ingredeints, instructions, and iamge.
function createRecipeElements(post) {
  try {
    const recipeTitle = document.querySelector(".dish");
    const ingredientList = document.getElementById("ingredient-list");
    const instructionsList = document.getElementById("recipe-instructions");
    const figureContainer = document.querySelector(".content-img");

    recipeTitle.textContent = post.title.rendered;

    ingredientList.innerHTML = "";
    instructionsList.innerHTML = "";

    // Parsing the content
    const contentDoc = parser.parseFromString(
      post.content.rendered,
      "text/html"
    );

    // Making variables for WP REST API elements
    const ingredients = contentDoc.querySelector("ul");
    if (ingredients) {
      ingredientList.innerHTML = ingredients.innerHTML;
    }

    const instructions = contentDoc.querySelector("ol");
    if (instructions) {
      instructionsList.innerHTML = instructions.innerHTML;
    }

    // Removing classes from WP REST API and add my own
    const figure = contentDoc.querySelector("figure");
    if (figure) {
      figure.classList.remove("wp-block-image", "size-full");

      const imgElement = figure.querySelector("img");
      if (imgElement) {
        imgElement.classList.remove("wp-image-62");
        imgElement.classList.add("w-100", "block", "recipe-img");
        //Event Listner for bigger img on click
        imgElement.addEventListener("click", function () {
          openModal(this.src);
        });
      }

      const figcaption = figure.querySelector("figcaption");
      if (figcaption) {
        figcaption.classList.add("visually-hidden");
      }

      figureContainer.innerHTML = "";
      figureContainer.appendChild(figure);
    }

    //This function set the makes the first letter the string to uppercase, and the rest to lowercase. it will also change the title to the titleId of the post.
    function capitalizeFirstLetter(str) {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    document.title = `James Cook | ${capitalizeFirstLetter(
      post.title.rendered
    )}`;

    //Adding notes with querySelector
    const ratingValueElement = document.querySelector(".rating-value");
    ratingValueElement.textContent = post["rating-value"];

    const heartIcon = document.createElement("i");
    heartIcon.className = "fas fa-heart";

    ratingValueElement.appendChild(heartIcon);

    document.querySelector(".difficulty-value").textContent = post["difficulty-value"];
    document.querySelector(".time-value").textContent = post["time-value"];
    document.querySelector(".category-value").textContent = post["category-value"];
    document.querySelector(".type-value").textContent = post["type-value"];
    document.querySelector(".origin-value").textContent = post["origin-value"];
    
  } catch (error) {
    console.error("Error displaying the recipe:", error);
    errorRecipeMessage.textContent =
      "I fetched the recipe but are having trouble displaying it right now. Please refresh the page or try again later. Feel free to check out similar dishes below";
  }
}

// This function opens the modal to display the recipe img bigger also close the modal when click outside imagemodal or closeIcon.
function openModal(src) {
  var modal = document.getElementById("imageModal");
  var modalImg = document.getElementById("enlargedImage");

  modal.style.display = "block";
  modalImg.src = src;

  window.onclick = function (event) {
    var modal = document.getElementById("imageModal");

    if (
      event.target == modal ||
      event.target.classList.contains("close") ||
      event.target.parentElement.classList.contains("close")
    ) {
      modal.style.display = "none";
    }
  };
}

//---------- Fetch and Create-------------//

//---- This function loads and display recipe page. it fetch main recipe post by ID, creates element for the details, and fetches and displays 3 similar dishes(category)
async function loadRecipe() {
  let recipeLoaded = false;
  let similarDishesLoaded = false;

  try {
    if (postId) {
      loaderSlider.classList.remove("hidden");

      const post = await fetchPostById(postId);
      createRecipeElements(post);
      recipeLoaded = true;
      loaderSlider.classList.add("hidden");

      const categoryNames = post.categories.map((id) =>
        getCategoryNameById(id)
      );
      if (categoryNames.length > 0) {
        loaderSimilar.classList.remove("hidden");

        const similarDishes = await fetchSimilarDishes(categoryNames, postId);
        createSimilarDishesElements(similarDishes.slice(0, 3));
        similarDishesLoaded = true;

        loaderSimilar.classList.add("hidden");
      }
    } else {
      errorRecipeMessage.textContent =
        "Something went wrong. It could be due to a network issue, an invalid recipe ID, or the recipe not being found. Please check your connection, verify the recipe details, and try again later.";
      loaderSlider.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error loading recipe page:", error);
    if (!recipeLoaded) {
      errorRecipeMessage.textContent =
        "I'm having trouble serving up this recipe right now. Please refresh the page or try again later. I'm working to get everything back to the kitchen as soon as possible!";
      loaderSlider.classList.add("hidden");
    } else if (!similarDishesLoaded) {
      errorSimilarMessage.textContent =
        "Just a heads up: I managed to fetch the recipe, but I'm having a bit of trouble loading suggestions for similar dishes. Feel free to enjoy the recipe, and check back later for more culinary inspirations!";
      loaderSimilar.classList.add("hidden");
    }
  }
}

loadRecipe();

//------------------------- COMMENT FORM -------------------------//

//This function makes date string readable, and takes the users locatl settings into consideration.
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

const form = document.getElementById("commentForm");
//
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("commentName").value;
    const comment = document.getElementById("commentText").value;
    const email = document.getElementById("commentEmail").value;
    //collect name,comment and email then send the data to wordpress also makes the postId a number
    const commentData = {
      author_name: name,
      author_email: email,
      content: comment,
      post: parseInt(postId, 10),
    };
    submitCommentToWordPress(commentData);
  });
} else {
  console.error("Form element not found");
}
//Autofill Email. as wordpress only allowed the comment endpoint to work with the email included(This input is not visible in html.)
document.getElementById("commentEmail").value = "tinberg92@hotmail.com";
window.addEventListener("load", () => {
  fetchAndDisplayComments(postId);
});

//---------- Fetch -------------//

//This function send the commentData that is saved to wordpress.
async function submitCommentToWordPress(commentData) {
  const originalUrl =
    "https://james-smith.cmsbackendsolutions.com/wp-json/wp/v2/comments";
  const url = corsAnywhereUrl + originalUrl;
  //i would not use username and appPassword in the code, but rather make it in the wordpress if this was a real blog
  const username = "james-smith.cmsbackendsolutions.com";
  const appPassword = "lqMp 5wMN LbPM 2HD8 9uCQ REqV";
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append(
    "Authorization",
    "Basic " + btoa(username + ":" + appPassword)
  );
  headers.append("X-Requested-With", "XMLHttpRequest");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(commentData),
    });

    if (response.ok) {
      const postedComment = await response.json();

      document.getElementById("commentName").value = "";
      document.getElementById("commentText").value = "";
      document.getElementById("commentEmail").value = "";

      await fetchAndDisplayComments(postId);
    } else {
      console.error("Failed to post comment - Server responded with an error");
      errorPostCommentsMessage.textContent =
        "Your comment couldn't be posted due to a server issue. Please check your comment for any issues and try again.";
    }
  } catch (error) {
    console.error("Error submitting comment:", error);
    errorPostCommentsMessage.textContent =
      "I couldn't submit your comment due to a network or system error. Please check your internet connection and try again later.";
  }
}
// Event listener for toggleCommentsButton
document
  .getElementById("toggleCommentsButton")
  .addEventListener("click", async function () {
    const commentSection = document.getElementById("commentSection");
    const toggleButton = document.getElementById("toggleCommentsButton");
    const commentCount = toggleButton.dataset.comments || "0";

    if (
      commentSection.style.display === "none" ||
      commentSection.style.display === ""
    ) {
      commentSection.style.display = "block";
      toggleButton.textContent = commentCount + " Comments ▲";

      // it will not fetch comments if they already been loaded.
      if (!toggleButton.dataset.commentsLoaded) {
        await fetchAndDisplayComments(postId);
      }
    } else {
      commentSection.style.display = "none";
      toggleButton.textContent = commentCount + " Comments ▼";
    }
  });

window.addEventListener("load", () => {
  fetchAndDisplayComments(postId);
});

//---------- Fetch and Create-------------//

//This funciton get the comments from wordpress for each spesific post and dynamically shows the comments
async function fetchAndDisplayComments(postId) {
  try {
    loaderComment.classList.remove("hidden");
    const response = await fetch(
      `https://james-smith.cmsbackendsolutions.com/wp-json/wp/v2/comments?post=${postId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const comments = await response.json();
    const commentCount = comments.length;
    const toggleButton = document.getElementById("toggleCommentsButton");
    toggleButton.dataset.comments = commentCount;
    toggleButton.textContent = commentCount + " Comments ▼";
    toggleButton.dataset.commentsLoaded = "true";

    const commentsContainer = document.getElementById("commentsContainer");
    commentsContainer.innerHTML = "";

    comments.forEach((comment) => {
      const commentElement = document.createElement("div");
      commentElement.className = "comment-item";
      const formattedDate = formatDate(comment.date);
      commentElement.innerHTML = `
              <p class="comment-name">${comment.author_name}:</p>
              <p class="comment-date">${formattedDate}</p>
              <p class="comment-content">${comment.content.rendered}</p>
          `;
      commentsContainer.appendChild(commentElement);
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    errorCommentsMessage.textContent =
      "Apologies, but I'm currently experiencing difficulties in displaying comments. I kindly ask you to try reloading the page in a short while. In the meantime, feel free to leave a comment – it might still be successfully submitted. Thank you for your understanding.";
    const toggleButton = document.getElementById("toggleCommentsButton");
    toggleButton.textContent = "Comments ▼";
  } finally {
    loaderComment.classList.add("hidden");
  }
}
