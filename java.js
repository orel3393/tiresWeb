const containersConfig = [
  { selector: "#popular", filter: p => p.title === "popular" },
  { selector: "#special", filter: p => p.title === "special" },
  { selector: "#sales", filter: p => p.sale === true },
  { selector: "#categories", filter: p => p.brand === "michelin" && p.sale === false },
  { selector: "#michelinSale", filter: p => p.brand === "michelin" && p.sale === true },
  { selector: "#conti", filter: p => p.brand === "continental" && p.sale === false },
  { selector: "#contiSale", filter: p => p.brand === "continental" && p.sale === true },
  { selector: "#falken", filter: p => p.brand === "falken" && p.sale === false },
  { selector: "#falkenSale", filter: p => p.brand === "falken" && p.sale === true }
];

let productsCache = null;

function getProducts() {
  if (productsCache) return Promise.resolve(productsCache);
  return fetch("products.json").then(r => r.json()).then(data => {
    productsCache = Array.isArray(data) ? data : data.products || [];
    return productsCache;
  });
}

function mountProducts(selector, filterFn) {
  const container = document.querySelector(selector);
  if (!container) return;
  getProducts().then(products => {
    products.filter(filterFn).forEach(p => container.append(createProductCard(p)));
  }).catch(() => {});
}

containersConfig.forEach(cfg => mountProducts(cfg.selector, cfg.filter));

const containerMarket = document.querySelector(".allProductMarket");
const payment = document.querySelector(".forms");
let totalPay = document.createElement("h2");
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCart() {
  if (containerMarket) {
    containerMarket.innerHTML = "";
    let total = 0;
    cart.forEach((product, index) => {
      const card = createMarketCard(product, index);
      containerMarket.append(card);
      total += product.price * product.quantity;
    });
    totalPay.innerHTML = `<span dir="ltr">₪${total.toLocaleString()}</span>  : סה"כ לתשלום`;
    localStorage.setItem("cart", JSON.stringify(cart));
  }
}

updateCart();
if (payment) {
  payment.prepend(totalPay);
}

const containerLike = document.querySelector("#like");
if (containerLike) {
  let likeCart = JSON.parse(localStorage.getItem("likeCart")) || [];
  likeCart.forEach(product => {
    let productCard = createProductCard(product);
    containerLike.append(productCard);
  });
}

function createMarketCard(product, index) {
  let productMarketDiv = document.createElement("div");
  productMarketDiv.classList.add("productMarket");

  let productMarketImage = document.createElement("div");
  productMarketImage.classList.add("images");

  let productMarketImg = document.createElement("div");
  productMarketImg.classList.add("imgs");

  let image1 = document.createElement("img");
  image1.src = product.images[0];
  image1.width = 120;
  image1.height = 150;

  let image2 = document.createElement("img");
  image2.src = product.images[1];
  image2.width = 100;
  image2.height = 150;

  productMarketImg.append(image1, image2);

  let brandImage = document.createElement("img");
  brandImage.src = product.brandImage;
  brandImage.width = 220;
  brandImage.height = 50;

  productMarketImage.append(productMarketImg, brandImage);

  let titlesDiv = document.createElement("div");

  let h2_1 = document.createElement("h2");
  h2_1.innerText = product.type;

  let h2_2 = document.createElement("h2");
  h2_2.innerText = product.name;

  let h2_3 = document.createElement("h2");
  h2_3.innerText = product.size;

  titlesDiv.append(h2_1, h2_2, h2_3);

  let detailsDiv = document.createElement("div");
  detailsDiv.classList.add("detailsMarket");

  let pricePerUnit = document.createElement("h4");
  if (product.sale === true) {
    pricePerUnit.innerHTML = `:מחיר ליחידה<br><del>${product.priceBefore}₪</del> ${product.price}₪`;
  } else {
    pricePerUnit.innerHTML = `:מחיר ליחידה<br>${product.price}₪`;
  }

  let priceTotal = document.createElement("h4");
  priceTotal.innerHTML = `:מחיר למוצר<br>${product.price * product.quantity}₪`;

  detailsDiv.append(pricePerUnit, priceTotal);

  let actionsDiv = document.createElement("div");

  let removeBtn = document.createElement("button");
  removeBtn.classList.add("buttonPay");
  removeBtn.innerText = "הסר";
  removeBtn.addEventListener("click", () => {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
  });

  let shopDiv = document.createElement("div");
  shopDiv.classList.add("shop");

  let minusBtn = document.createElement("button");
  minusBtn.innerText = "-";
  minusBtn.addEventListener("click", () => {
    if (cart[index].quantity > 1) {
      cart[index].quantity--;
    } else {
      cart.splice(index, 1);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
  });

  let form = document.createElement("form");
  let input = document.createElement("input");
  input.type = "number";
  input.value = product.quantity;
  input.min = 1;
  input.addEventListener("change", function (event) {
    let val = parseInt(event.target.value);
    if (!isNaN(val) && val > 0) {
      cart[index].quantity = val;
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCart();
    }
  });
  form.append(input);

  let plusBtn = document.createElement("button");
  plusBtn.innerText = "+";
  plusBtn.addEventListener("click", () => {
    cart[index].quantity++;
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
  });

  let quantityText = document.createElement("h4");
  quantityText.innerText = ":כמות";

  shopDiv.append(minusBtn, form, plusBtn, quantityText);
  actionsDiv.append(removeBtn, shopDiv);

  productMarketDiv.append(productMarketImage, titlesDiv, detailsDiv, actionsDiv);
  return productMarketDiv;
}

function createProductCard(product) {
  let productDiv = document.createElement("div");
  productDiv.classList.add("product");
  productDiv.dataset.brand = product.brand;
  productDiv.dataset.roadGrip = product.roadGrip;
  productDiv.dataset.sponge = product.sponge;
  productDiv.dataset.price = product.price;

  let link = document.createElement("a");
  link.href = "product.html";
  link.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.setItem("selectedProductId", product.id);
    window.location.href = "product.html";
  });

  let like = document.createElement("i");
  like.classList.add("fa-solid", "fa-heart");
  like.style.cursor = "pointer";

  let likeCart = JSON.parse(localStorage.getItem("likeCart")) || [];
  const foundItem = likeCart.find(item => item.id === product.id);
  const isLiked = foundItem !== undefined;
  if (isLiked) {
    like.classList.add("heart-icon");
  }

  like.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    like.classList.toggle("heart-icon");
    let likeCart = JSON.parse(localStorage.getItem("likeCart")) || [];
    if (like.classList.contains("heart-icon")) {
      if (!likeCart.some(item => item.id === product.id)) {
        likeCart.push(product);
        localStorage.setItem("likeCart", JSON.stringify(likeCart));
        showNotification("נוסף למועדפים! ❤️", "success");
      }
    } else {
      likeCart = likeCart.filter(item => item.id !== product.id);
      localStorage.setItem("likeCart", JSON.stringify(likeCart));
      showNotification("הוסר מהמועדפים", "info");
    }
  });

  let imgsDiv = document.createElement("div");
  imgsDiv.classList.add("imgs");

  let img1 = document.createElement("img");
  img1.src = product.images[0];
  img1.width = 150;
  img1.height = 170;

  let img2 = document.createElement("img");
  img2.src = product.images[1];
  img2.width = 110;
  img2.height = 170;

  imgsDiv.append(img1, img2);

  let brandDiv = document.createElement("div");
  let brandImg = document.createElement("img");
  brandImg.src = product.brandImage;
  brandImg.width = 280;
  brandImg.height = 60;
  brandDiv.append(brandImg);

  let titleDiv = document.createElement("div");
  let name = document.createElement("h2");
  name.innerText = product.name;
  let size = document.createElement("h2");
  size.innerText = `${product.size} :מידה`;

  let saleButton = document.createElement("div");
  if (product.sale === true) {
    saleButton.innerText = "🔥 רבעיית צמיגים במבצע";
    saleButton.classList.add("sale");
  }

  titleDiv.append(saleButton, name, size);

  let detailsDiv = document.createElement("div");
  detailsDiv.classList.add("details");
  let text = document.createElement("p");
  text.innerText = product.description;
  detailsDiv.append(text);

  let priceButton = document.createElement("button");
  priceButton.classList.add("price");
  let price = document.createElement("h3");
  if (product.sale && product.priceBefore) {
    let priceBefore = document.createElement("del");
    priceBefore.innerText = `${product.priceBefore}₪`;
    priceBefore.classList.add("del");
    price.innerText = `מחיר כולל אזון והתקנה: ${product.price}₪`;
    priceButton.append(priceBefore, price);
  } else {
    price.innerText = `מחיר כולל אזון והתקנה: ${product.price}₪`;
    priceButton.append(price);
  }

  let marketDiv = document.createElement("div");
  marketDiv.classList.add("market");

  let addText = document.createElement("h3");
  addText.innerText = "הוסף לסל";

  let cartIcon = document.createElement("i");
  cartIcon.classList.add("fa-solid", "fa-cart-shopping");

  marketDiv.addEventListener("click", () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        priceBefore: product.priceBefore,
        images: product.images,
        brandImage: product.brandImage,
        type: product.type,
        size: product.size,
        sale: product.sale,
        quantity: 1
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    showNotification("המוצר נוספה לעגלה! 🛒", "success");
  });

  marketDiv.append(cartIcon, addText);
  link.append(imgsDiv, brandDiv, titleDiv, detailsDiv, priceButton);
  productDiv.append(link, marketDiv);
  productDiv.append(like);

  return productDiv;
}

function showNotification(message, type = "info") {
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach(notification => notification.remove());
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  const colors = {
    success: "#4CAF50",
    error: "#f44336",
    info: "#2196F3"
  };
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-size: 16px;
    font-weight: 500;
    max-width: 300px;
    word-wrap: break-word;
    animation: slideInRight 0.3s ease-out;
    font-family: 'Open Sans', serif;
  `;
  notification.textContent = message;
  document.body.append(notification);
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-in";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

const notificationStyles = document.createElement("style");
notificationStyles.textContent = `
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slideOutRight {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}
`;
document.head.append(notificationStyles);

document.addEventListener("DOMContentLoaded", () => {
  let container = document.querySelector("#productContainer");
  const productId = localStorage.getItem("selectedProductId");
  getProducts()
    .then(products => {
      const product = products.find(p => p.id == productId);
      if (!product || !container) return;

      const productDiv = document.createElement("div");
      productDiv.className = "theProduct";
      const oneProductDiv = document.createElement("div");
      oneProductDiv.className = "oneProduct";

      const imgsDiv = document.createElement("div");
      imgsDiv.className = "imgs";

      const img1 = document.createElement("img");
      img1.src = product.images[0];
      img1.width = 270;
      img1.height = 300;

      const img2 = document.createElement("img");
      img2.src = product.images[1];
      img2.width = 180;
      img2.height = 300;

      imgsDiv.append(img1, img2);
      oneProductDiv.append(imgsDiv);

      let brandDiv = document.createElement("div");
      let brandImg = document.createElement("img");
      brandImg.src = product.brandImage;
      brandImg.width = 450;
      brandImg.height = 100;
      brandDiv.append(brandImg);
      oneProductDiv.append(brandDiv);

      let textDiv = document.createElement("div");
      textDiv.classList.add("text");

      let textInnerDiv = document.createElement("div");

      let h1 = document.createElement("h1");
      h1.innerText = product.name;

      let h3Size = document.createElement("h3");
      h3Size.innerText = `${product.size} :מידה`;

      let saleButton = document.createElement("div");
      if (product.sale === true) {
        saleButton.innerText = "🔥 רבעיית צמיגים במבצע";
        saleButton.classList.add("sale");
      }

      const pDesc = document.createElement("p");
      pDesc.innerText = product.description;

      let description = document.createElement("div");
      description.innerText = product.brandDescription;

      let date = document.createElement("h3");
      date.innerText = `תאריך ייצור: ${product.manufacturingDate}`;

      let h3Price = document.createElement("h3");
      if (product.sale && product.priceBefore) {
        let priceBefore = document.createElement("del");
        priceBefore.innerText = `${product.priceBefore}₪`;
        priceBefore.classList.add("del");
        h3Price.innerText = `מחיר כולל אזון והתקנה: ${product.price}₪`;
        h3Price.append(priceBefore);
      } else {
        h3Price.innerText = `מחיר כולל אזון והתקנה: ${product.price}₪`;
      }

      textInnerDiv.append(h1, h3Size, saleButton, pDesc, description, date, h3Price);

      let marketDiv = document.createElement("div");
      marketDiv.classList.add("market");

      let addText = document.createElement("h3");
      addText.innerText = "הוסף לסל";

      let cartIcon = document.createElement("i");
      cartIcon.classList.add("fa-solid", "fa-cart-shopping");

      marketDiv.addEventListener("click", () => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            priceBefore: product.priceBefore,
            images: product.images,
            brandImage: product.brandImage,
            type: product.type,
            size: product.size,
            sale: product.sale,
            quantity: 1
          });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        showNotification("המוצר נוספה לעגלה! 🛒", "success");
      });

      marketDiv.append(addText, cartIcon);

      let like = document.createElement("i");
      like.classList.add("fa-solid", "fa-heart");
      like.style.cursor = "pointer";

      let likeCart2 = JSON.parse(localStorage.getItem("likeCart")) || [];
      const isLiked2 = likeCart2.some(item => item.id === product.id);
      if (isLiked2) {
        like.classList.add("heart-icon");
      }

      like.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        like.classList.toggle("heart-icon");
        let likeCart = JSON.parse(localStorage.getItem("likeCart")) || [];
        if (like.classList.contains("heart-icon")) {
          if (!likeCart.some(item => item.id === product.id)) {
            likeCart.push(product);
            localStorage.setItem("likeCart", JSON.stringify(likeCart));
            showNotification("נוסף למועדפים! ❤️", "success");
          }
        } else {
          likeCart = likeCart.filter(item => item.id !== product.id);
          localStorage.setItem("likeCart", JSON.stringify(likeCart));
          showNotification("הוסר מהמועדפים", "info");
        }
      });

      textDiv.append(textInnerDiv, marketDiv, like);
      productDiv.append(oneProductDiv, textDiv);
      container.append(productDiv);
    })
    .catch(() => {});
});

document.addEventListener("DOMContentLoaded", function () {
  const questions = document.querySelectorAll("accordion .question, .accordion .question");
  questions.forEach(question => {
    question.addEventListener("click", () => {
      const answer = question.nextElementSibling;
      if (!answer) return;
      if (answer.style.display === "block") {
        answer.style.display = "none";
      } else {
        answer.style.display = "block";
      }
    });
  });
  document.querySelectorAll(".accordion .answer").forEach(answer => {
    answer.style.display = "none";
  });
});

const slides = document.querySelectorAll(".slideImg");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
const dots = document.querySelectorAll(".dot");
let currentIndex = 0;

function updateSlide() {
  slides.forEach((slide, index) => {
    slide.classList.remove("active");
    if (index === currentIndex) slide.classList.add("active");
  });
  dots.forEach(dot => dot.classList.remove("active"));
  if (dots[currentIndex]) dots[currentIndex].classList.add("active");
}

if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlide();
  });
}
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlide();
  });
}
dots.forEach(dot => {
  dot.addEventListener("click", (e) => {
    currentIndex = parseInt(e.target.dataset.index);
    updateSlide();
  });
});
updateSlide();
const autoSlideInterval = 5000;
setInterval(() => {
  currentIndex = (currentIndex + 1) % slides.length;
  updateSlide();
}, autoSlideInterval);

document.querySelectorAll(".filter-accordion").forEach((accordion) => {
  accordion.addEventListener("click", () => {
    accordion.classList.toggle("active");
    const panel = accordion.nextElementSibling;
    if (!panel) return;
    if (panel.classList.contains("open")) {
      panel.classList.remove("open");
    } else {
      panel.classList.add("open");
    }
  });
});

const searchContainer = document.querySelector("#productSearch");
let theSearch = document.querySelector("#search");
if (theSearch && searchContainer) {
  theSearch.addEventListener("input", () => {
  });
}

const track = document.querySelector("#brandsTrack");
const brands = [
  "michelin.png","continantal.png","PIRELLI.png","falken.png",
  "dunlop.png","goodyear.png","toyo.png","BF-GOODRICH.png",
  "BRIDGESTONE.png","Kumho.png","KLEBER.png","YOKOHAMA.png",
  "maxxis.png","NANKANG.png"
];
if (track) {
  brands.forEach(src => {
    const img = document.createElement("img");
    img.src = `image/${src}`;
    img.alt = src.split(".")[0];
    track.append(img);
  });
  let position = 0;
  const speed = 1;
  function animate() {
    position -= speed;
    if (Math.abs(position) >= track.scrollWidth) {
      position = 0;
    }
    track.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(animate);
  }
  animate();
}

document.addEventListener("DOMContentLoaded", () => {
  const widthSelect = document.querySelector("#tireWidth");
  const aspectSelect = document.querySelector("#tireAspect");
  const diameterSelect = document.querySelector("#tireDiameter");
  const form = document.querySelector("#sizeForm");
  const searchContainer = document.querySelector("#productSearch");
  const resultsHeader = document.querySelector(".results");
  const filtersSection = document.querySelector(".filters");
  const formsWrapper = document.querySelector(".forms");

  if (resultsHeader) resultsHeader.style.display = "none";
  if (filtersSection) filtersSection.style.display = "none";

  if (resultsHeader && filtersSection) {
    const filterWrapper = document.createElement("div");
    filterWrapper.style.display = "flex";
    filterWrapper.style.justifyContent = "flex-end";
    filterWrapper.style.margin = "10px 0";
    filterWrapper.append(filtersSection);
    resultsHeader.insertAdjacentElement("afterend", filterWrapper);
  }

  const noResultsMsg = document.createElement("p");
  noResultsMsg.style.fontSize = "18px";
  noResultsMsg.style.fontWeight = "bold";
  noResultsMsg.style.textAlign = "center";
  noResultsMsg.style.marginTop = "10px";
  noResultsMsg.innerText = "לא נמצאו צמיגים תואמים 😕";
  noResultsMsg.style.display = "none";
  if (searchContainer && searchContainer.parentNode) {
    searchContainer.parentNode.insertBefore(noResultsMsg, searchContainer.nextSibling);
  }

  let clearBtn = document.querySelector("#clearFilterBtn");
  if (!clearBtn) {
    clearBtn = document.createElement("button");
    clearBtn.id = "clearFilterBtn";
    clearBtn.innerText = "חיפוש חדש";
    clearBtn.classList.add("submit");
    clearBtn.type = "button";
    if (formsWrapper) formsWrapper.append(clearBtn);
  } else {
    clearBtn.innerText = "חיפוש חדש";
  }

  let tires = [];
  let currentResults = [];

  function parseSize(sizeStr) {
    if (!sizeStr) return { width: "", aspect: "", diameter: "" };
    const cleaned = String(sizeStr).toUpperCase().replace(/\s+/g, "");
    let match = cleaned.match(/^(\d{3})\/(\d{2})\/R?(\d{2})/);
    if (!match) match = cleaned.match(/(\d{3}).*?(\d{2}).*?(\d{2})/);
    if (match) return { width: match[1], aspect: match[2], diameter: match[3] };
    return { width: "", aspect: "", diameter: "" };
  }

  function filterBySize(width, aspect, diameter) {
    const w = width ? String(width) : "";
    const a = aspect ? String(aspect) : "";
    const d = diameter ? String(diameter) : "";
    if (!w && !a && !d) return [];
    return tires.filter(tire => {
      const parsed = parseSize(tire.size);
      if (w && a && d) return parsed.width === w && parsed.aspect === a && parsed.diameter === d;
      if (w && a && !d) return parsed.width === w && parsed.aspect === a;
      if (w && d && !a) return parsed.width === w && parsed.diameter === d;
      if (a && d && !w) return parsed.aspect === a && parsed.diameter === d;
      if (w && !a && !d) return parsed.width === w;
      if (a && !w && !d) return parsed.aspect === a;
      if (d && !w && !a) return parsed.diameter === d;
      return false;
    });
  }

  function showResults(results) {
    if (!searchContainer) return;
    searchContainer.innerHTML = "";
    if (!results || results.length === 0) {
      noResultsMsg.style.display = "block";
      if (resultsHeader) resultsHeader.style.display = "none";
      if (filtersSection) filtersSection.style.display = "none";
      if (filterButton) filterButton.style.display = "none";
      return;
    }
    noResultsMsg.style.display = "none";
    results.forEach(product => {
      const card = createProductCard(product);
      searchContainer.append(card);
    });
    if (resultsHeader) resultsHeader.style.display = "block";
  }

  function performSearch(width, aspect, diameter) {
    const results = filterBySize(width, aspect, diameter);
    currentResults = results.slice();
    showResults(results);
    if (results && results.length > 0) afterSearchShowFilter();
    const qValue = [width || "", aspect || "", diameter || ""].filter(Boolean).join("-");
    const params = new URLSearchParams();
    if (qValue) params.set("q", qValue);
    const newUrl = window.location.pathname + (qValue ? "?" + params.toString() : "");
    window.history.replaceState({}, "", newUrl);
  }

  getProducts()
    .then(data => {
      tires = Array.isArray(data) ? data : data.products || [];
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get("q");
      if (q) {
        const parts = q.split("-");
        const [w, a, d] = parts;
        performSearch(w || "", a || "", d || "");
      }
    })
    .catch(() => {
      if (searchContainer) searchContainer.innerHTML = `<p style="color:red;text-align:center;">שגיאה בטעינת הנתונים.</p>`;
    });

  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const width = (widthSelect && widthSelect.value && widthSelect.value !== "רוחב צמיג") ? widthSelect.value : "";
      const aspect = (aspectSelect && aspectSelect.value && aspectSelect.value !== "חתך צמיג" && aspectSelect.value !== "חֶתְך צמיג") ? aspectSelect.value : "";
      const diameter = (diameterSelect && diameterSelect.value && diameterSelect.value !== "קוטר") ? diameterSelect.value : "";
      if (!width && !aspect && !diameter) {
        if (searchContainer) searchContainer.innerHTML = "";
        if (resultsHeader) resultsHeader.style.display = "none";
        noResultsMsg.style.display = "block";
        if (filtersSection) filtersSection.style.display = "none";
        if (filterButton) filterButton.style.display = "none";
        window.history.replaceState({}, "", window.location.pathname);
        currentResults = [];
        return;
      }
      performSearch(width, aspect, diameter);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (widthSelect) widthSelect.value = "רוחב צמיג";
      if (aspectSelect) aspectSelect.value = "חתך צמיג";
      if (diameterSelect) diameterSelect.value = "קוטר";
      if (searchContainer) searchContainer.innerHTML = "";
      if (resultsHeader) resultsHeader.style.display = "none";
      noResultsMsg.style.display = "none";
      if (filtersSection) filtersSection.style.display = "none";
      if (filterButton) filterButton.style.display = "none";
      window.history.replaceState({}, "", window.location.pathname);
      currentResults = [];
    });
  }

  let filterButton;
  function createFilterButton() {
    if (!resultsHeader) return;
    filterButton = document.createElement("button");
    filterButton.innerText = "סינון";
    filterButton.classList.add("filterBtn");
    filterButton.style.display = "none"; 
    resultsHeader.parentNode.insertBefore(filterButton, resultsHeader.nextSibling);
    filterButton.addEventListener("click", () => {
      buildFiltersUI();
      filterButton.style.display = "none";
      if (filtersSection) filtersSection.style.display = "block";
    });
  }
  createFilterButton();

  function afterSearchShowFilter() {
    if (filterButton) filterButton.style.display = "block";
  }

  if (!filtersSection) {
    const fs = document.createElement("div");
    fs.classList.add("filters");
    fs.style.display = "none";
    document.body.append(fs);
  }

  function buildFiltersUI() {
    const fs = document.querySelector(".filters");
    if (!fs) return;
    fs.innerHTML = "";

    const title = document.createElement("h3");
    title.innerText = "סינון תוצאות";
    fs.append(title);

    const brandsSet = new Set();
    const gripSet = new Set();
    const spongeSet = new Set();
    let minPrice = Infinity, maxPrice = -Infinity;

    currentResults.forEach(p => {
      if (p.brand) brandsSet.add(p.brand);
      if (p.roadGrip) gripSet.add(String(p.roadGrip).toUpperCase());
      if (typeof p.sponge === "string" && p.sponge) spongeSet.add(p.sponge);
      const priceVal = typeof p.price === "number" ? p.price : parseFloat(p.price || 0);
      if (!isNaN(priceVal)) {
        if (priceVal < minPrice) minPrice = priceVal;
        if (priceVal > maxPrice) maxPrice = priceVal;
      }
    });

    function createCheckboxGroup(labelText, className, valuesArray) {
      const group = document.createElement("div");
      group.classList.add("filter-group");
      group.style.marginBottom = "16px";

      const lbl = document.createElement("h4");
      lbl.innerText = labelText;
      lbl.style.marginBottom = "8px";
      group.append(lbl);

      valuesArray.sort().forEach(val => {
        const wrap = document.createElement("label");
        wrap.style.display = "block";
        wrap.style.marginBottom = "6px";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = val;
        input.classList.add(className);
        wrap.append(input);
        const span = document.createElement("span");
        span.innerText = " " + val;
        wrap.append(span);
        group.append(wrap);
      });
      return group;
    }

    if (brandsSet.size > 0) {
      const brands = Array.from(brandsSet);
      fs.append(createCheckboxGroup("מותג", "brand", brands));
    }
    if (gripSet.size > 0) {
      const grips = Array.from(gripSet);
      fs.append(createCheckboxGroup("אחיזת כביש", "roadGrip", grips));
    }
    if (spongeSet.size > 0) {
      const sponges = Array.from(spongeSet);
      fs.append(createCheckboxGroup("ספוג", "sponge", sponges));
    }

    const priceGroup = document.createElement("div");
    priceGroup.classList.add("filter-group");
    priceGroup.style.marginBottom = "16px";

    const priceLabel = document.createElement("h4");
    priceLabel.innerText = "טווח מחיר (₪)";
    priceLabel.style.marginBottom = "8px";
    priceGroup.append(priceLabel);

    const minRow = document.createElement("label");
    minRow.style.display = "block";
    minRow.style.marginBottom = "8px";
    minRow.innerText = "מינימום: ";
    const minInput = document.createElement("input");
    minInput.type = "number";
    minInput.id = "min-price";
    minInput.placeholder = String(isFinite(minPrice) ? Math.floor(minPrice) : 0);
    minInput.style.marginRight = "0";
    minRow.append(minInput);

    const maxRow = document.createElement("label");
    maxRow.style.display = "block";
    maxRow.style.marginBottom = "8px";
    maxRow.innerText = "מקסימום: ";
    const maxInput = document.createElement("input");
    maxInput.type = "number";
    maxInput.id = "max-price";
    maxInput.placeholder = String(isFinite(maxPrice) ? Math.ceil(maxPrice) : 99999);
    maxRow.append(maxInput);

    priceGroup.append(minRow);
    priceGroup.append(maxRow);
    fs.append(priceGroup);

    const buttonsRow = document.createElement("div");
    buttonsRow.style.display = "flex";
    buttonsRow.style.gap = "10px";
    buttonsRow.style.marginTop = "10px";

    const applyFilterBtn = document.createElement("button");
    applyFilterBtn.id = "filter-button";
    applyFilterBtn.innerText = "החל סינון";
    applyFilterBtn.classList.add("filterBtn");

    const hideBtn = document.createElement("button");
    hideBtn.type = "button";
    hideBtn.id = "hide-filters";
    hideBtn.classList.add("filterBtn");
    hideBtn.innerText = "הסתר סינון";

    buttonsRow.append(applyFilterBtn);
    buttonsRow.append(hideBtn);
    fs.append(buttonsRow);

    applyFilterBtn.addEventListener("click", () => {
      applyFiltersToCurrentResults();
    });

    hideBtn.addEventListener("click", () => {
      fs.style.display = "none";
      if (filterButton) filterButton.style.display = "block";
    });
  }

  function applyFiltersToCurrentResults() {
    const brandChecks = Array.from(document.querySelectorAll('input.brand:checked')).map(i => i.value.toString().toLowerCase());
    const roadGripChecks = Array.from(document.querySelectorAll('input.roadGrip:checked')).map(i => i.value.toString().toUpperCase());
    const spongeChecks = Array.from(document.querySelectorAll('input.sponge:checked')).map(i => i.value.toString());

    const minPriceEl = document.querySelector('#min-price');
    const maxPriceEl = document.querySelector('#max-price');
    const minPrice = minPriceEl && minPriceEl.value ? parseFloat(minPriceEl.value) : null;
    const maxPrice = maxPriceEl && maxPriceEl.value ? parseFloat(maxPriceEl.value) : null;

    let filtered = currentResults.filter(p => {
      if (brandChecks.length) {
        const pb = (p.brand || '').toString().toLowerCase();
        if (!brandChecks.includes(pb)) return false;
      }
      if (roadGripChecks.length) {
        const prg = (p.roadGrip || '').toString().toUpperCase();
        if (!roadGripChecks.includes(prg)) return false;
      }
      if (spongeChecks.length) {
        const ps = (p.sponge || '').toString();
        if (!spongeChecks.includes(ps)) return false;
      }
      const price = p.price != null ? Number(p.price) : null;
      if (minPrice != null && price != null && price < minPrice) return false;
      if (maxPrice != null && price != null && price > maxPrice) return false;
      return true;
    });

    showResults(filtered);
  }

  const freeSearchInput = document.querySelector("#search");
  const autoCompleteBox = document.createElement("div");
  autoCompleteBox.id = "autocomplete-box";
  autoCompleteBox.classList.add("autocomplete-box");
  if (freeSearchInput && freeSearchInput.parentNode) {
    freeSearchInput.parentNode.append(autoCompleteBox);
  }

  const brandList = ["michelin","continental","falken","bridgestone","dunlop","hankook","pirelli","riken","china"];

  function showAutoComplete(val) {
    if (!autoCompleteBox) return;
    autoCompleteBox.innerHTML = "";
    if (!val || val.length < 2) { autoCompleteBox.style.display = "none"; return; }
    const matches = brandList.filter(b => b.toLowerCase().startsWith(val.toLowerCase()));
    if (matches.length === 0) { autoCompleteBox.style.display = "none"; return; }
    matches.forEach(match => {
      const item = document.createElement("div");
      item.classList.add("autocomplete-item");
      item.innerText = match;
      item.addEventListener("click", () => {
        freeSearchInput.value = match;
        autoCompleteBox.style.display = "none";
        performBrandSearch(match);
      });
      autoCompleteBox.append(item);
    });
    autoCompleteBox.style.display = "block";
  }

  function performBrandSearch(brandName) {
    getProducts().then(products => {
      const results = products.filter(p => (p.brand || "").toLowerCase() === brandName.toLowerCase());
      currentResults = results.slice();
      showResults(results);
      if (results && results.length > 0) afterSearchShowFilter();
      window.history.replaceState({}, "", window.location.pathname);
    });
  }

  if (freeSearchInput) {
    freeSearchInput.addEventListener("input", () => {
      showAutoComplete(freeSearchInput.value);
    });
    freeSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        autoCompleteBox.style.display = "none";
        const val = freeSearchInput.value.trim();
        if (val) performBrandSearch(val);
      }
    });
    document.addEventListener("click", (e) => {
      if (!autoCompleteBox.contains(e.target) && e.target !== freeSearchInput) {
        autoCompleteBox.style.display = "none";
      }
    });
  }
});


let usersCache = null;

function loadUsers() {
    if (usersCache) return Promise.resolve(usersCache);
    return fetch('users.json')
        .then(response => response.json())
        .then(data => {
            usersCache = data.users || [];
            return usersCache;
        })
        .catch(error => {
            console.error('Error loading users:', error);
            return [];
        });
}

function checkLogin() {
    const usernameInput = document.querySelector('#username');
    const passwordInput = document.querySelector('#password');
    
    const username = usernameInput.value;
    const password = passwordInput.value;
    
    if (!username || !password) {
        alert('אנא מלא את שני השדות!');
        return;
    }
    
    loadUsers().then(users => {
        const foundUser = users.find(user => user.username === username);
        
        if (!foundUser) {
            alert('שם משתמש לא נמצא!');
            return;
        }
        
        if (foundUser.password !== password) {
            alert('סיסמה שגויה!');
            return;
        }
        
        alert('ברוך הבא, ' + foundUser.firstName + '!');
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        window.location.href = 'homepage.html';
    });
}

function logout() {
    localStorage.removeItem('currentUser');
    alert('התנתקת בהצלחה!');
    window.location.href = 'enetpage.html';
}

function checkUserStatus() {
    const currentUser = localStorage.getItem('currentUser');
    const userStatusDiv = document.querySelector('#user-status');
    const mobileUserStatusDiv = document.querySelector('#mobile-user-status');
    
    if (currentUser) {
        const user = JSON.parse(currentUser);
        
       
        if (userStatusDiv) {
            userStatusDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; flex-direction: row-reverse;">
                    <span style="font-weight: bold;">שלום, ${user.firstName}!</span>
                    <button onclick="logout()" class="logout-btn">התנתק</button>
                </div>
            `;
        }
     
        if (mobileUserStatusDiv) {
            mobileUserStatusDiv.innerHTML = `
                <div class="user-info">
                    <span class="user-name">שלום, ${user.firstName}!</span>
                    <button onclick="logout()" class="mobile-logout-btn">התנתק</button>
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    checkUserStatus();
    
    const loginForm = document.querySelector('.login form');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            checkLogin();
        });
    }
});


document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  
  if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
          hamburger.classList.toggle('active');
          mobileMenu.classList.toggle('active');
          if (mobileOverlay) {
              mobileOverlay.classList.toggle('active');
          }
      });
      
      if (mobileOverlay) {
          mobileOverlay.addEventListener('click', () => {
              hamburger.classList.remove('active');
              mobileMenu.classList.remove('active');
              mobileOverlay.classList.remove('active');
          });
      }
      
      const mobileLinks = document.querySelectorAll('.mobile-menu a');
      mobileLinks.forEach(link => {
          link.addEventListener('click', () => {
              hamburger.classList.remove('active');
              mobileMenu.classList.remove('active');
              if (mobileOverlay) {
                  mobileOverlay.classList.remove('active');
              }
          });
      });
  }
});