const router = require('koa-router')();
const checkAdmin = require('./middlewares/checkAdmin');

// Home
router.get('', require('./controllers/home/homeCtrl').index);

// Auth
router.get('hi', require('./controllers/users/authCtrl').check);
router.post('login', require('./controllers/users/authCtrl').auth);
router.post('logout', require('./controllers/users/authCtrl').logout);

// Users
router.get('users', require('./controllers/users/usersCtrl').getUsers);
router.get('users/:id', require('./controllers/users/usersCtrl').getDetails);
router.post('users/:id', require('./controllers/users/usersCtrl').updateUser);

// Admin
router.get('admin', checkAdmin, require('./controllers/admin/adminCtrl').index);
router.get('admin/access_log', checkAdmin, require('./controllers/admin/adminCtrl').accesslog);
router.get('admin/statistic', checkAdmin, require('./controllers/admin/adminCtrl').statistic);
router.get('admin/control', checkAdmin, require('./controllers/admin/adminCtrl').control);

// Music
router.get('music', require('./controllers/music/musicCtrl').index);
router.get('music/libraries', require('./controllers/music/musicCtrl').libraries);
router.get('music/libraries/:libraryName', require('./controllers/music/musicCtrl').libraryDetails);
router.post(checkAdmin, 'music/libraries', require('./controllers/music/musicCtrl').createLibrary);
router.delete(checkAdmin, 'music/libraries/:libraryName', require('./controllers/music/musicCtrl').deleteLibrary);
router.post(checkAdmin, 'music/libraries/:libraryName', require('./controllers/music/musicCtrl').createCompilationsBulk);
router.get('music/artists', require('./controllers/music/musicCtrl').artists);
router.get('music/artists/:library/:name', require('./controllers/music/musicCtrl').getArtistByName);
router.get('music/search', require('./controllers/music/musicCtrl').search);
router.get('music/random', require('./controllers/music/musicCtrl').random);
router.get('music/songs', require('./controllers/music/musicCtrl').byhref);
router.post('music/extract', checkAdmin, require('./controllers/music/musicCtrl').extract);
router.delete('music/songs', checkAdmin, require('./controllers/music/musicCtrl').dropSongs);
// router.delete(checkAdmin, '/api/music/songs', require('./views/music').dropSongs);

// Playlists
router.get('music/playlists', require('./controllers/music/playlistsCtrl').playlists);
router.get('music/playlists/:owner', require('./controllers/music/playlistsCtrl').playlistsByOwner);
router.get('music/playlists/:owner/:name', require('./controllers/music/playlistsCtrl').playlistDetails);
router.put('music/playlists/:owner/:name', require('./controllers/music/playlistsCtrl').updatePlaylist);
router.delete('music/playlists/:owner/:name', require('./controllers/music/playlistsCtrl').deletePlaylist);


module.exports = router;
