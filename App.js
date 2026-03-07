document.addEventListener("DOMContentLoaded", () => {
    // --- 1. ELEMENTS & STATE ---
    const dashboardView = document.getElementById("dashboard-view");
    const loginView = document.getElementById("login-view");
    const registerView = document.getElementById("register-view");
    const feedContainer = document.getElementById("feed-container");
    const usernameDisplay = document.getElementById("display-username");

    // Load posts from Local Storage or start with an empty array
    let posts = JSON.parse(localStorage.getItem("reviewers_posts")) || [];

    // --- 2. NAVIGATION LOGIC ---
    const showView = (view) => {
        [dashboardView, loginView, registerView].forEach(v => v.style.display = "none");
        view.style.display = (view === dashboardView) ? "block" : "flex";
    };

    document.getElementById("link-to-register").onclick = (e) => { e.preventDefault(); showView(registerView); };
    document.getElementById("link-to-login").onclick = (e) => { e.preventDefault(); showView(loginView); };
    document.getElementById("btn-logout").onclick = () => { showView(loginView); };

    document.getElementById("form-login").onsubmit = (e) => {
        e.preventDefault();
        const user = e.target.querySelector('input[name="username"]').value;
        usernameDisplay.innerText = user || "Guest";
        showView(dashboardView);
    };

    // --- 3. CORE POST RENDERING ---
    const renderPosts = () => {
        // Clear existing posts (but keep the create-post form)
        const createSection = document.getElementById("create-post-section");
        feedContainer.innerHTML = '';
        feedContainer.appendChild(createSection);

        posts.forEach((post, index) => {
            const postDiv = document.createElement("div");
            postDiv.className = "post";
            postDiv.innerHTML = `
                <div class="title">${post.title}</div>
                <div class="body">${post.body}</div>
                <div class="footer">
                    <div class="profilePicture"><img src="pic.png" alt="P"/></div>
                    <div class="username"><a href="#">${post.author}</a></div>
                    <div class="buttons">
                        <button class="commentBttn">Com</button>
                        <button class="likeBttn" data-index="${index}">Like</button>
                        <label>${post.likes}</label>
                    </div>
                </div>
                <div class="listOfComments">
                    ${post.comments.map((c, i) => `
                        <div class="comment">
                            <h3>${c.user}</h3>
                            <label>${c.text}</label>
                            <button class="delete" data-post="${index}" data-comm="${i}">X</button>
                        </div>
                    `).join('')}
                    <div class="addComment">
                        <input type="text" placeholder="Add Comment..." data-index="${index}" />
                        <button class="submitComment" data-index="${index}">Comment</button>
                    </div> 
                </div>`;
            feedContainer.appendChild(postDiv);
        });
    };

    // --- 4. DATA ACTIONS (Create, Like, Comment, Delete) ---
    const saveData = () => {
        localStorage.setItem("reviewers_posts", JSON.stringify(posts));
        renderPosts();
    };

    // Create Post
    document.getElementById("form-create-post").onsubmit = (e) => {
        e.preventDefault();
        const title = e.target.title.value;
        const body = e.target.postText.value;
        posts.unshift({ title, body, author: usernameDisplay.innerText, likes: 0, comments: [] });
        e.target.reset();
        saveData();
    };

    // Handle Clicks inside Feed (Event Delegation)
    feedContainer.addEventListener("click", (e) => {
        const idx = e.target.getAttribute("data-index");

        // Like logic
        if (e.target.classList.contains("likeBttn")) {
            posts[idx].likes++;
            saveData();
        }

        // Comment logic
        if (e.target.classList.contains("submitComment")) {
            const input = feedContainer.querySelector(`input[data-index="${idx}"]`);
            if (input.value.trim()) {
                posts[idx].comments.push({ user: usernameDisplay.innerText, text: input.value });
                saveData();
            }
        }

        // Delete comment logic
        if (e.target.classList.contains("delete")) {
            const pIdx = e.target.getAttribute("data-post");
            const cIdx = e.target.getAttribute("data-comm");
            posts[pIdx].comments.splice(cIdx, 1);
            saveData();
        }
    });

    // Initial Load
    renderPosts();
    showView(loginView);
});
