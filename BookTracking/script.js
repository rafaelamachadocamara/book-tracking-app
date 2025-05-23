document.addEventListener('DOMContentLoaded', function () {
    const addBookBtn = document.getElementById('addBookBtn');
    const emptyAddBookBtn = document.getElementById('emptyAddBookBtn');
    const bookFormContainer = document.getElementById('bookFormContainer');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const bookForm = document.getElementById('bookForm');
    const booksContainer = document.getElementById('booksContainer');
    const emptyLibrary = document.getElementById('emptyLibrary');
    const trackerPlaceholder = document.getElementById('trackerPlaceholder');
    const chapterTracker = document.getElementById('chapterTracker');
    const chaptersList = document.getElementById('chaptersList');
    const deleteBookBtn = document.getElementById('deleteBookBtn');

    const bookCover = document.getElementById('bookCover');
    const bookTitle = document.getElementById('bookTitle');
    const bookAuthor = document.getElementById('bookAuthor');
    const bookProgress = document.getElementById('bookProgress');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const commentsCount = document.getElementById('commentsCount');

    let books = [];
    let selectedBook = null;
    let selectedChapter = null;

    function loadBooks() {
        const savedBooks = localStorage.getItem('readingTrackerBooks');
        if (savedBooks) {
            books = JSON.parse(savedBooks);
            renderBooks();
        }
    }

    function saveBooks() {
        localStorage.setItem('readingTrackerBooks', JSON.stringify(books));
    }

    function showBookForm() {
        bookFormContainer.classList.remove('hidden');
    }

    function hideBookForm() {
        bookFormContainer.classList.add('hidden');
        bookForm.reset();
    }

    function addBook(event) {
        event.preventDefault();

        const title = document.getElementById('title').value.trim();
        const author = document.getElementById('author').value.trim();
        const coverUrl = document.getElementById('coverUrl').value.trim();
        const totalChapters = parseInt(document.getElementById('totalChapters').value) || 1;

        if (!title || !author || totalChapters < 1) {
            alert('Please fill in all required fields');
            return;
        }

        const newBook = {
            id: Date.now().toString(),
            title,
            author,
            coverUrl,
            totalChapters,
            readChapters: [],
            chapterComments: {},
            dateAdded: new Date().toISOString()
        };

        books.push(newBook);
        saveBooks();
        renderBooks();
        hideBookForm();
    }

    function renderBooks() {
        if (books.length === 0) {
            emptyLibrary.classList.remove('hidden');
            booksContainer.innerHTML = '';
        } else {
            emptyLibrary.classList.add('hidden');

            let booksHTML = '';

            books.forEach(book => {
                const progress = getReadingProgress(book);
                const isSelected = selectedBook && selectedBook.id === book.id;
                const coverContent = book.coverUrl
                    ? `<img src="${book.coverUrl}" alt="${book.title}">`
                    : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                       </svg>`;

                const commentsDisplay = Object.keys(book.chapterComments).length > 0
                    ? `<span>${Object.keys(book.chapterComments).length} comments</span>`
                    : '';

                booksHTML += `
                    <div class="book-card ${isSelected ? 'selected' : ''}" data-id="${book.id}">
                        <div class="book-cover-container">
                            ${coverContent}
                        </div>
                        <div class="book-content">
                            <h3 class="book-title">${book.title}</h3>
                            <p class="book-author">${book.author}</p>
                            <div class="book-stats">
                                <span class="book-stats-label">Progress</span>
                                <span class="badge">${book.readChapters.length}/${book.totalChapters} chapters</span>
                            </div>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill ${getProgressColorClass(progress)}" style="width: ${progress}%"></div>
                                </div>
                                <div class="progress-info">
                                    <span>${progress}% complete</span>
                                    ${commentsDisplay}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            booksContainer.innerHTML = booksHTML;

            document.querySelectorAll('.book-card').forEach(card => {
                card.addEventListener('click', () => selectBook(card.dataset.id));
            });
        }
    }

    function selectBook(bookId) {
        selectedBook = books.find(book => book.id === bookId);
        selectedChapter = null;

        if (selectedBook) {
            trackerPlaceholder.classList.add('hidden');
            chapterTracker.classList.remove('hidden');

            updateBookDetails();
            renderChapters();
            renderBooks(); 
        }
    }

    function updateBookDetails() {
        if (!selectedBook) return;

        if (selectedBook.coverUrl) {
            bookCover.innerHTML = `<img src="${selectedBook.coverUrl}" alt="${selectedBook.title}">`;
        } else {
            bookCover.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
            </svg>`;
        }

        bookTitle.textContent = selectedBook.title;
        bookAuthor.textContent = selectedBook.author;

        const progress = getReadingProgress(selectedBook);
        bookProgress.textContent = `${selectedBook.readChapters.length}/${selectedBook.totalChapters} chapters`;
        progressFill.style.width = `${progress}%`;
        progressFill.className = `progress-fill ${getProgressColorClass(progress)}`;
        progressPercent.textContent = `${progress}% complete`;

        const commentCount = Object.keys(selectedBook.chapterComments).length;
        commentsCount.textContent = `${commentCount} comments`;
    }

    function renderChapters() {
        if (!selectedBook) return;

        let chaptersHTML = '';

        for (let i = 1; i <= selectedBook.totalChapters; i++) {
            const chapterNumber = i;
            const isRead = selectedBook.readChapters.includes(chapterNumber);
            const hasComment = selectedBook.chapterComments[chapterNumber];
            const isSelected = selectedChapter === chapterNumber;

            const checkIcon = isRead
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                   </svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                   </svg>`;

            const commentIcon = hasComment
                ? `<span class="comment-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                   </span>`
                : '';

            const editingBadge = isSelected ? '<span class="edit-badge">editing</span>' : '';

            const commentDisplay = hasComment && !isSelected
                ? `<div class="chapter-comment">
                    <div class="comment-content">
                        <p class="comment-text">${hasComment}</p>
                        <span class="delete-comment" data-chapter="${chapterNumber}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                            </svg>
                        </span>
                    </div>
                   </div>`
                : '';

            const commentForm = isSelected
                ? `<div class="comment-form">
                    <textarea class="comment-textarea" id="commentText" placeholder="Add your thoughts about this chapter...">${hasComment || ''}</textarea>
                    <div class="comment-actions">
                        <button class="btn btn-primary" id="saveComment" data-chapter="${chapterNumber}">Save Comment</button>
                        <button class="btn btn-outline" id="cancelComment">Cancel</button>
                        ${hasComment ? `<button class="btn btn-danger" id="deleteComment" data-chapter="${chapterNumber}">Delete</button>` : ''}
                    </div>
                   </div>`
                : '';

            chaptersHTML += `
                <div class="chapter-item">
                    <div class="chapter-header ${isSelected ? 'selected' : ''} ${isRead ? 'read' : ''}" data-chapter="${chapterNumber}">
                        <div class="chapter-title">
                            <span class="chapter-check ${isRead ? 'checked' : ''}" data-chapter="${chapterNumber}">
                                ${checkIcon}
                            </span>
                            <span class="${isRead ? 'read' : ''}">Chapter ${chapterNumber}</span>
                        </div>
                        <div class="chapter-actions">
                            ${commentIcon}
                            ${editingBadge}
                        </div>
                    </div>
                    ${commentDisplay}
                    ${commentForm}
                </div>
            `;
        }

        chaptersList.innerHTML = chaptersHTML;

        document.querySelectorAll('.chapter-header').forEach(header => {
            header.addEventListener('click', () => toggleChapterSelection(parseInt(header.dataset.chapter)));
        });

        document.querySelectorAll('.chapter-check').forEach(check => {
            check.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleChapterRead(parseInt(check.dataset.chapter));
            });
        });

        document.querySelectorAll('.delete-comment').forEach(btn => {
            btn.addEventListener('click', () => deleteComment(parseInt(btn.dataset.chapter)));
        });

        const saveCommentBtn = document.getElementById('saveComment');
        if (saveCommentBtn) {
            saveCommentBtn.addEventListener('click', () => saveComment(parseInt(saveCommentBtn.dataset.chapter)));
        }

        const cancelCommentBtn = document.getElementById('cancelComment');
        if (cancelCommentBtn) {
            cancelCommentBtn.addEventListener('click', cancelComment);
        }

        const deleteCommentBtn = document.getElementById('deleteComment');
        if (deleteCommentBtn) {
            deleteCommentBtn.addEventListener('click', () => deleteComment(parseInt(deleteCommentBtn.dataset.chapter)));
        }
    }

    function toggleChapterSelection(chapterNumber) {
        if (selectedChapter === chapterNumber) {
            selectedChapter = null;
        } else {
            selectedChapter = chapterNumber;
        }
        renderChapters();
    }

    function toggleChapterRead(chapterNumber) {
        if (!selectedBook) return;

        const isRead = selectedBook.readChapters.includes(chapterNumber);

        if (isRead) {
            selectedBook.readChapters = selectedBook.readChapters.filter(ch => ch !== chapterNumber);
        } else {
            selectedBook.readChapters.push(chapterNumber);
            selectedBook.readChapters.sort((a, b) => a - b);
        }

        updateBook(selectedBook);
    }

    function saveComment(chapterNumber) {
        if (!selectedBook) return;

        const commentText = document.getElementById('commentText').value.trim();

        if (commentText) {
            selectedBook.chapterComments[chapterNumber] = commentText;
            updateBook(selectedBook);
            selectedChapter = null;
        }
    }

    function cancelComment() {
        selectedChapter = null;
        renderChapters();
    }

    function deleteComment(chapterNumber) {
        if (!selectedBook) return;

        delete selectedBook.chapterComments[chapterNumber];
        updateBook(selectedBook);
        selectedChapter = null;
    }

    function deleteBookHandler() {
        if (!selectedBook) return;

        if (confirm(`Are you sure you want to delete "${selectedBook.title}"?`)) {
            books = books.filter(book => book.id !== selectedBook.id);
            saveBooks();
            selectedBook = null;
            selectedChapter = null;
            renderBooks();
            trackerPlaceholder.classList.remove('hidden');
            chapterTracker.classList.add('hidden');
        }
    }

    function updateBook(updatedBook) {
        books = books.map(book => book.id === updatedBook.id ? updatedBook : book);
        saveBooks();
        updateBookDetails();
        renderChapters();
        renderBooks();
    }

    function getReadingProgress(book) {
        return Math.round((book.readChapters.length / book.totalChapters) * 100);
    }

    function getProgressColorClass(progress) {
        if (progress === 100) return 'progress-high';
        if (progress >= 50) return 'progress-medium';
        return '';
    }

    addBookBtn.addEventListener('click', showBookForm);
    emptyAddBookBtn.addEventListener('click', showBookForm);
    closeFormBtn.addEventListener('click', hideBookForm);
    cancelBtn.addEventListener('click', hideBookForm);
    bookForm.addEventListener('submit', addBook);
    deleteBookBtn.addEventListener('click', deleteBookHandler);

    loadBooks();
});