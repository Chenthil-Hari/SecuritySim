import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://chenthilhari_db_user:l1TwxpmxYbxNTnJI@cluster0.bxur4zk.mongodb.net/Gameathon?retryWrites=true&w=majority&appName=Cluster0')
.then(async () => {
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    let hasBadTeamId = false;
    users.forEach(u => {
        if (u.teamId && typeof u.teamId === 'string' && !mongoose.Types.ObjectId.isValid(u.teamId)) {
            console.log('Bad teamId for user', u.username, ':', u.teamId);
            hasBadTeamId = true;
        }
    });
    if (!hasBadTeamId) console.log('No bad teamIds found based on string vs ObjectId check.');
    
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
