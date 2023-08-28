import serviceURL from 'mcutils/api/serviceURL';
if(window.location.host.includes('localhost')){
    serviceURL.api = 'https://localhost/macarte-api/api/';
}