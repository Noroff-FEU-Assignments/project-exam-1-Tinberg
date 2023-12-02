//---------- API, SORTBY AND FILTER-------------//

//---------- Global Variables-------------//
const cache = {};
let currentPage = 1;
const postsContainer = document.querySelector(".posts");
const viewMoreBtn = document.getElementById("viewMoreBtn");
const filterSelect = document.getElementById("filterSelect");
const sortSelect = document.getElementById("sortSelect");
const errorMessage = document.getElementById("error-message");
const slides = document.querySelectorAll(".slide");
const heroPosts = document.querySelector(".hero-posts");
const numberOfSlides = slides.length;
const angle = 360 / numberOfSlides;
let currentActive = 0;

//---------- API, SORTBY AND FILTER-------------//
// This function filter map from category in API
function getCategoryId(filterValue) {
  const categoryMap = {
    //Origin
    america: 63,
    greece: 61,
    italy: 62,
    france: 64,
    ireland: 65,
    england: 66,
    japan: 67,
    //Category
    brunch: 70,
    pastry: 68,
    dessert: 71,
    dinner: 69,
  };
  return categoryMap[filterValue] || null;
}

// Event listener for category filter from index, and about page. It displays the category/origin and loops through the select element and sets it to true with the current category.
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get("filter");

  if (filterParam) {
    for (const option of filterSelect.options) {
      if (option.value === filterParam) {
        option.selected = true;
        break;
      }
    }
  }

  try {
    // ---------- Initial Load ----------//
    await loadPosts("newest", filterSelect.value);
  } catch (error) {
    //error message for loadposts
    console.error("Error occurred while loading posts on page load:", error);
    if (errorMessage) {
      errorMessage.textContent =
        "I'm currently unable to load the recipes. This might be due to a network issue or an error on my end. Please check your internet connection, and if the problem persists, visit me again later.";
    }
  }
});

//---------- Fetch -------------//

// This function fetches the API with 10 posts, with sortBy set to newest and no filter
async function fetchPosts(
  perPage = 10,
  page = 1,
  sortBy = "newest",
  filter = "all"
) {
  const corsAnywhereUrl = "https://noroffcors.onrender.com/";
  let originalUrl = `https://james-smith.cmsbackendsolutions.com/wp-json/wp/v2/posts?_embed&per_page=${perPage}&page=${page}`;

  const cacheKey = `${originalUrl}_${sortBy}_${filter}`;

  //check response catch
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  // SortBy and Filter logic
  if (sortBy === "newest") {
    originalUrl += "&orderby=date&order=desc";
  } else if (sortBy === "oldest") {
    originalUrl += "&orderby=date&order=asc";
  } else if (sortBy === "title1") {
    originalUrl += "&orderby=title&order=asc";
  } else if (sortBy === "title2") {
    originalUrl += "&orderby=title&order=desc";
  }

  // This logic is based on GetCategoryID from the filter map, and it splits the name and id, making the endpoint specific to the category/origin.
  if (filter !== "all") {
    let categoryId;

    if (filter.startsWith("origin-")) {
      categoryId = getCategoryId(filter.split("-")[1]);
    } else if (filter.startsWith("category-")) {
      categoryId = getCategoryId(filter.split("-")[1]);
    }

    if (categoryId) {
      originalUrl += `&categories=${categoryId}`;
    }
  }

  // Full API with proxy
  const url = corsAnywhereUrl + originalUrl;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the response
    const totalPosts = parseInt(response.headers.get("X-WP-Total"), 10);
    const posts = await response.json();

    // check if the cach is updated and stored
    cache[cacheKey] = { posts, totalPosts };
    return cache[cacheKey];
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error(
      "It looks like my recipe book is temporarily unavailable. Please refresh your palate (and the page) or try again shortly!"
    );
  }
}

//---------- Create -------------//

// This function creates DOM elements and parses the image from the string to create an article with post details.
function createPostsElements(post) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(post.content.rendered, "text/html");
    const image = doc.querySelector("img");
    const imageUrl = image ? image.src : "";
    const imageAlt = image ? image.alt : "Image not available";

    const article = document.createElement("article");
    article.className = "post";
    article.innerHTML = `
          <a href="/html/recipe.html?post_id=${post.id}" class="a-post box-shadow">
            <img class="img-small block" src="${imageUrl}" alt="${imageAlt}">
            <h3 class="h3-post">${post.title.rendered}</h3>
            <div class="hover-content text-left">
              <p class="flex space-between">
                MY RATING:
                <span class="rating-value">${post["rating-value"]}<i class="fa-solid fa-heart"></i></span>
              </p>
              <p class="flex space-between">
                DIFFICULTY: <span class="difficulty-value">${post["difficulty-value"]}</span>
              </p>
              <p class="flex space-between">
                TIME: <span class="time-value">${post["time-value"]}</span>
              </p>
              <p class="flex space-between">
                CATEGORY: <span class="category-value">${post["category-value"]}</span>
              </p>
              <p class="flex space-between">
                TYPE: <span class="type-value">${post["type-value"]}</span>
              </p>
              <p class="flex space-between">
                ORIGIN: <span class="origin-value">${post["origin-value"]}</span>
              </p>
            </div>
          </a>
        `;
    return article;
  } catch (error) {
    console.error("Error creating post element:", error);
    throw new Error(
      "I'm experiencing some challenges in the kitchen, and my recipes aren't displaying as expected. Please refresh the page or try visiting me again a little later!"
    );
  }
}

// Event listeners for buttons, sortBy, and Filter.
viewMoreBtn.addEventListener("click", () => {
  currentPage++;
  loadPosts(sortSelect.value);
});

sortSelect.addEventListener("change", () => {
  currentPage = 1;
  loadPosts(sortSelect.value, filterSelect.value);
});

filterSelect.addEventListener("change", () => {
  currentPage = 1;
  loadPosts(sortSelect.value, filterSelect.value);
});

//---------- Fetch and Create -------------//

// This function loads the posts based on the current page, sorting order, and filter. It creates "post" for each item in the API and shows or hides the button depending on if there are more posts to load.
//Initial Load in DomContent at the top
async function loadPosts(sortBy = "newest", filter = "all") {
  if (currentPage === 1) {
    postsContainer.innerHTML = "";
    const loadingSpinner = document.getElementById("loadingSpinner");
    loadingSpinner.classList.remove("hidden");
  }
  try {
    const data = await fetchPosts(10, currentPage, sortBy, filter);
    const { posts, totalPosts } = data;

    posts.forEach((post) => {
      const postElement = createPostsElements(post);
      postsContainer.appendChild(postElement);
    });

    if (postsContainer.children.length >= totalPosts) {
      viewMoreBtn.classList.add("hidden");
    } else {
      viewMoreBtn.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error in loadPosts:", error);
    //Error message is located in fetch and create functions, loadPosts is located in DOMContentLoad at the top
    if (errorMessage) {
      errorMessage.textContent = error.message;
    }
    viewMoreBtn.classList.add("hidden");
  } finally {
    loadingSpinner.classList.add("hidden");
  }
}

//---------- 3D SLIDER-------------//

slides[currentActive].classList.add("active");

// This function loops through the articles and removes the background image that is set and adds a new class for the next image (in CSS).
function updateBackgroundImage() {
  for (let i = 1; i <= numberOfSlides; i++) {
    heroPosts.classList.remove("bg-slide" + i);
  }
  heroPosts.classList.add("bg-slide" + (currentActive + 1));
}

// This function changes the active slide and makes the slide go back to the beginning when there are no slides left in the loop. It's also a loop for the 3D slider (to make it 3D).
function rotateSlider(direction) {
  slides[currentActive].classList.remove("active");
  if (direction === "right") {
    currentActive = (currentActive + 1) % numberOfSlides;
  } else {
    currentActive = (currentActive - 1 + numberOfSlides) % numberOfSlides;
  }
  for (let i = 0; i < numberOfSlides; i++) {
    let currentAngle = angle * (i - currentActive);
    slides[
      i
    ].style.transform = `translate(-50%, -50%) rotateY(${currentAngle}deg) translateZ(250px)`;
  }
  slides[currentActive].classList.add("active");
  updateBackgroundImage();
}

document.querySelector(".left").addEventListener("click", () => {
  rotateSlider("left");
});

document.querySelector(".right").addEventListener("click", () => {
  rotateSlider("right");
});

updateBackgroundImage();

setInterval(() => {
  rotateSlider("right");
}, 3500);
