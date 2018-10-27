const router = require('koa-router')()
const checkRoles = require('./middlewares/checkRoles')

const checkAuth = checkRoles()
const checkAdmin = checkRoles('admin')

// Home
router.get('', require('./controllers/homeCtrl').index)

// Auth
router.post('access', require('./controllers/authCtrl').renewAccessToken)
router.post('pair', require('./controllers/authCtrl').renewTokenPair)
router.post('login', require('./controllers/authCtrl').auth)
router.post('logout', require('./controllers/authCtrl').logout)

// Users
router.get('users', require('./controllers/usersCtrl').getUsers)
router.get('users/:id', require('./controllers/usersCtrl').getDetails)
router.post('users/:id', require('./controllers/usersCtrl').updateUser)

// Admin
router.get('admin', checkAdmin, require('./controllers/adminCtrl').index)
router.get('admin/access_log', checkAdmin, require('./controllers/adminCtrl').accesslog)
router.get('admin/statistic', checkAdmin, require('./controllers/adminCtrl').statistic)
router.get('admin/control', checkAdmin, require('./controllers/adminCtrl').control)

// Music
router.get('music', require('./controllers/musicCtrl').index)
router.get('music/artists', require('./controllers/musicCtrl').artists)
router.get('music/artists/:library/:name', require('./controllers/musicCtrl').getArtistByName)
router.get('music/search', require('./controllers/musicCtrl').search)
router.get('music/random', require('./controllers/musicCtrl').random)
router.get('music/songs', require('./controllers/musicCtrl').bySrc)
router.get('music/stats/single', require('./controllers/musicCtrl').addSingleStat)
router.get('music/tracks/:trackId', require('./controllers/musicCtrl').getTrackInfo)
router.put('music/tracks/:trackId', require('./controllers/musicCtrl').setTrackInfo)

// CRM
// router.post('music/extract', checkAdmin, require('./controllers/old/musicCRMCtrl').extract)
// router.delete('music/songs', checkAdmin, require('./controllers/old/musicCRMCtrl').dropSongs)
// router.post('music/libraries/:libraryName', checkAdmin, require('./controllers/old/musicCRMCtrl').createCompilationsBulk)

// Manager
//router.post('manager/libraries/:libraryName/mountpoints', require('./controllers/path/pathCtrl').add)
router.get('manager/libraries/:libraryName/import/sessions', require('./controllers/importCtrl').getImportSessionsByLibraryName)

router.get('manager/imports/:sessionName', require('./controllers/importCtrl').getImportSessionByName)
router.post('manager/imports/:sessionName/tree', require('./controllers/importCtrl').getTree)
router.post('manager/imports/:sessionName/tree/confirm', require('./controllers/importCtrl').confirmSession)
router.get('manager/imports/:sessionName/progress', require('./controllers/importCtrl').checkProgress)
router.post('manager/imports/:sessionName/extract', require('./controllers/importCtrl').extractTrackSources)

// Playlists
router.get('music/playlists', require('./controllers/playlistsCtrl').playlists)
router.get('music/playlists/:owner', require('./controllers/playlistsCtrl').playlistsByOwner)
router.get('music/playlists/:owner/:name', require('./controllers/playlistsCtrl').playlistDetails)
router.put('music/playlists/:owner/:name', checkAuth, require('./controllers/playlistsCtrl').updatePlaylist)
router.delete('music/playlists/:owner/:name', checkAuth, require('./controllers/playlistsCtrl').deletePlaylist)


module.exports = router
