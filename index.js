var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var randomstring = require('randomstring');
var randomInt = require('random-int');

app.use(express.static(__dirname + '/public'));

var jobCount = 1;

app.get('/create-job', (req, res) => {
    var jobId = randomstring.generate(12);
    var jobName = "Job #"+jobCount++;
    res.json({job: { id: jobId, name: jobName}});
    var jobStatus = {
        progress: { current: 0, total: 0},
        text: '',
        status: ''
    };

    var asyncFunc = new Promise((resolve, reject) => {
        var max = randomInt(10, 5000);
        var iter = 0;
        jobStatus.status = 'running';
        jobStatus.progress.total = max;
        var nss = '/job'+jobId;
        var ns = io.of(nss);
        ns.on('connect', (socket)=>{
            console.log('-> connected');
            if (jobStatus.status == 'complete') {
                socket.emit('complete', jobStatus);
                socket.close();
            } else{
                socket.emit('start', jobStatus);
            }
            socket.on('disconnect', ()=>{
                console.log('-> disconnected');
            })
        });


        console.log('Job started: '+jobName);
        var proc = () => {
            if (iter < max) {
                iter = iter + randomInt(1, Math.round(max/50));
                console.log('Job iterations ('+jobName+'): '+iter)
                jobStatus.progress.current = iter;
                jobStatus.text = 'Job iterations ('+jobName+'): '+iter;
                ns.emit('update', jobStatus)
                setTimeout(proc, randomInt(100,5000));
            }else {
                console.log('Job stopped: '+jobName)
                jobStatus.status = 'complete';
                ns.emit('complete', jobStatus);
                //setTimeout(()=>console.log(io.nsps), 1000);
                resolve(jobStatus);
            }
        }
        setTimeout(proc, randomInt(100, 5000));
    }).then(x=>{
        console.log(x);
    });

});

http.listen(5000, ()=>{
    console.log('Server started (port :5000)');
});