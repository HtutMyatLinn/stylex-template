(function () {
  var KEY = "stylex-shop-profile";
  var FOLLOW = "stylex-shop-follow";
  var profile = load();
  var tab = "home";
  var products = [
    { name: "Ivory Silk Column Dress", price: "$680" },
    { name: "Noir Tailored Wool Blazer", price: "$740" },
    { name: "Pleated Satin Midi Skirt", price: "$420" },
    { name: "Sculpt Leather Ankle Boot", price: "$560" }
  ];

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved && saved.name) return saved;
    } catch (error) {}
    return {
      name: "Atelier Noir",
      slug: "ateliernoir",
      logo: "",
      cover: "",
      story: "Atelier Noir cuts quiet tailoring in small runs in Yangon.",
      philosophy: {
        vision: "Clothes that stay in a wardrobe for years.",
        mission: "Make precise garments with local workshops.",
        ideas: "Restraint, proportion, and cloth that ages well.",
        concepts: "City uniform, small batch, repairable pieces."
      },
      founders: [{ name: "Amelia Noir", role: "Founder", bio: "Cuts the collection and runs the workroom.", photo: "" }],
      phone: "09123456789",
      address: "No. 18, Pansodan Street, Yangon",
      socials: {
        facebook: "https://facebook.com/ateliernoir",
        instagram: "https://instagram.com/ateliernoir",
        tiktok: "https://tiktok.com/@ateliernoir"
      },
      policy: { window: "14", conditions: ["unworn", "tagged"], terms: "Returns are accepted in the original condition with proof of purchase." },
      vacation: false,
      followers: 12840
    };
  }

  function text(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function plainStory(value) {
    var box = document.createElement("div");
    box.innerHTML = String(value || "");
    return box.textContent;
  }

  var banner = document.getElementById("vacation-banner");
  banner.hidden = !profile.vacation;
  document.getElementById("shop-name").textContent = profile.name;
  document.getElementById("shop-url").textContent = "marketplace.com/shop/" + profile.slug;
  if (profile.cover) document.getElementById("shop-cover").style.backgroundImage = "url(" + profile.cover + ")";
  if (profile.logo) document.getElementById("shop-logo").style.backgroundImage = "url(" + profile.logo + ")";
  var followers = profile.followers || 12840;
  var following = localStorage.getItem(FOLLOW) === "1";
  var follow = document.getElementById("follow-shop");
  function paintFollow() {
    follow.setAttribute("aria-pressed", String(following));
    follow.textContent = following ? "Following" : "Follow Shop";
    document.getElementById("shop-followers").textContent = (followers + (following ? 1 : 0)).toLocaleString() + " followers";
  }
  paintFollow();
  follow.addEventListener("click", function () {
    following = !following;
    localStorage.setItem(FOLLOW, following ? "1" : "0");
    paintFollow();
  });
  document.getElementById("shop-social").innerHTML = ["facebook", "instagram", "tiktok"].filter(function (key) {
    return profile.socials && profile.socials[key];
  }).map(function (key) {
    return '<a href="' + text(profile.socials[key]) + '" target="_blank" rel="noopener">' + key + "</a>";
  }).join("");

  document.querySelector('[data-panel="home"]').innerHTML = '<article class="public-card"><h2>From the workroom</h2><p>' + text(profile.philosophy && profile.philosophy.vision) + "</p></article>";
  document.querySelector('[data-panel="story"]').innerHTML = '<article class="public-card"><h2>Story</h2><p>' + text(plainStory(profile.story)) + '</p></article><div class="public-grid">' +
    [["Vision", "vision"], ["Mission", "mission"], ["Ideas", "ideas"], ["Core concepts", "concepts"]].map(function (pair) {
      return '<article class="public-card"><h3>' + pair[0] + "</h3><p>" + text(profile.philosophy && profile.philosophy[pair[1]]) + "</p></article>";
    }).join("") + "</div>";
  document.querySelector('[data-panel="founders"]').innerHTML = '<div class="public-grid">' + (profile.founders || []).map(function (founder) {
    var photo = founder.photo ? ' style="background-image:url(' + founder.photo + ')"' : "";
    return '<article class="public-card"><div class="public-product"' + photo + '></div><h3>' + text(founder.name) + "</h3><p>" + text(founder.role) + "</p><p>" + text(founder.bio) + "</p></article>";
  }).join("") + "</div>";
  document.querySelector('[data-panel="products"]').innerHTML = '<div class="public-products">' + products.map(function (item) {
    var off = profile.vacation || profile.checkoutDisabled ? " disabled" : "";
    return '<article class="public-card"><div class="public-product"></div><h3>' + text(item.name) + "</h3><p>" + text(item.price) + '</p><button type="button"' + off + '>Add to Cart</button> <button type="button"' + off + ">Buy Now</button></article>";
  }).join("") + "</div>";
  var conditions = (profile.policy && profile.policy.conditions || []).join(", ");
  document.querySelector('[data-panel="policies"]').innerHTML = '<article class="public-card"><h2>Returns</h2><p>' + text((profile.policy && profile.policy.window) || "14") + " day window. " + text(conditions) + "</p><p>" + text(profile.policy && profile.policy.terms) + "</p><h2>Contact</h2><p>" + text(profile.phone) + "</p><p>" + text(profile.address) + "</p></article>";

  document.getElementById("shop-tabs").addEventListener("click", function (event) {
    var button = event.target.closest("[data-tab]");
    if (!button) return;
    tab = button.dataset.tab;
    document.querySelectorAll("#shop-tabs button").forEach(function (item) {
      item.setAttribute("aria-pressed", String(item === button));
    });
    document.querySelectorAll("[data-panel]").forEach(function (panel) {
      panel.hidden = panel.dataset.panel !== tab;
    });
  });
})();
