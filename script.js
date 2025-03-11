document.addEventListener('DOMContentLoaded', () => {
    fetch('/books')
        .then(res => res.json())
        .then(data => {
            document.getElementById('books-list').innerHTML = data.map(book => 
                `<div>${book.title} by ${book.author}</div>`
            ).join('');
        });
});
