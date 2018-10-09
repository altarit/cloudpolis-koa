const router = require('koa-router')()
const checkRoles = require('./middlewares/checkRoles')

const checkAuth = checkRoles()
const checkAdmin = checkRoles('admin')

// Home
router.get('', require('./controllers/home/homeCtrl').index)

// Auth
router.get('hi', require('./controllers/auth/authCtrl').check)
router.post('access', require('./controllers/auth/authCtrl').renewAccessToken)
router.post('pair', require('./controllers/auth/authCtrl').renewTokenPair)
router.post('login', require('./controllers/auth/authCtrl').auth)
router.post('logout', require('./controllers/auth/authCtrl').logout)

// Users
router.get('users', require('./controllers/users/usersCtrl').getUsers)
router.get('users/:id', require('./controllers/users/usersCtrl').getDetails)
router.post('users/:id', require('./controllers/users/usersCtrl').updateUser)

// Admin
router.get('admin', checkAdmin, require('./controllers/admin/adminCtrl').index)
router.get('admin/access_log', checkAdmin, require('./controllers/admin/adminCtrl').accesslog)
router.get('admin/statistic', checkAdmin, require('./controllers/admin/adminCtrl').statistic)
router.get('admin/control', checkAdmin, require('./controllers/admin/adminCtrl').control)

// Music
router.get('music', require('./controllers/music/musicCtrl').index)
router.get('music/libraries', require('./controllers/music/musicCtrl').libraries)
router.get('music/libraries/:libraryName', require('./controllers/music/musicCtrl').libraryDetails)
router.post('music/libraries', checkAdmin, require('./controllers/music/musicCtrl').createLibrary)
router.delete('music/libraries/:libraryName', checkAdmin, require('./controllers/music/musicCtrl').deleteLibrary)
router.get('music/artists', require('./controllers/music/musicCtrl').artists)
router.get('music/artists/:library/:name', require('./controllers/music/musicCtrl').getArtistByName)
router.get('music/search', require('./controllers/music/musicCtrl').search)
router.get('music/random', require('./controllers/music/musicCtrl').random)
router.get('music/songs', require('./controllers/music/musicCtrl').bySrc)
router.get('music/stats/single', require('./controllers/music/musicCtrl').addSingleStat)
router.get('music/tracks/:trackId', require('./controllers/music/musicCtrl').getTrackInfo)
router.put('music/tracks/:trackId', require('./controllers/music/musicCtrl').setTrackInfo)

// CRM
router.post('music/extract', checkAdmin, require('./controllers/music/musicCRMCtrl').extract)
router.delete('music/songs', checkAdmin, require('./controllers/music/musicCRMCtrl').dropSongs)
router.post('music/libraries/:libraryName', checkAdmin, require('./controllers/music/musicCRMCtrl').createCompilationsBulk)

// Path
router.post('path/dir', require('./controllers/path/pathCtrl').getDir)

// Playlists
router.get('music/playlists', require('./controllers/music/playlistsCtrl').playlists)
router.get('music/playlists/:owner', require('./controllers/music/playlistsCtrl').playlistsByOwner)
router.get('music/playlists/:owner/:name', require('./controllers/music/playlistsCtrl').playlistDetails)
router.put('music/playlists/:owner/:name', checkAuth, require('./controllers/music/playlistsCtrl').updatePlaylist)
router.delete('music/playlists/:owner/:name', checkAuth, require('./controllers/music/playlistsCtrl').deletePlaylist)


module.exports = router