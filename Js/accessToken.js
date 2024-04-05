document.getElementById('accessTokenBtn').addEventListener('click', function(){
    const digimal_id = document.getElementById('digi_id').value;
    const digimal_password = document.getElementById('digi_password').value;

    const postUserData = {
        id_no: digimal_id,
        password: digimal_password
    };
    
    fetch('https://training.digimal.uonbi.ac.ke/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postUserData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        if(data.success) {
            // If login is successful, store the token in local storage
            localStorage.setItem('accessToken', data.token);
            alert('Access token fetched successfully');
            window.location.href = "index.html";
        } else {
            alert('Access token refresh failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
    
})