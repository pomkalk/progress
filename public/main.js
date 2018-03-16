$(()=>{
    $('#start-button').click(()=>{
        var sb = $('#start-button');
        var content = $('#content');
        if ( !sb.hasClass('disabled')) {
            //sb.addClass('disabled');
            
            $.get('create-job', {}, (response)=>{
                var socket = io('/job'+response.job.id);
                var progress = $('<div class="ui indicating progress"><div class="bar"><div class="progress"></div></div><div class="label"></div></div>');


                socket.on('start', (res)=>{
                    //content.html('');
                    content.append(progress);
                    progress.progress({
                        value: res.progress.value,
                        total: res.progress.total,
                        label: res.text,
                        text: {
                            ratio: '{value} of {total}'
                        }
                    });
                    console.log(res);
                });

                socket.on('update', (res)=>{
                    progress.progress('set progress', res.progress.current);
                    progress.progress('set label', res.text);
                    console.log(res);
                });

                socket.on('complete', (res)=>{
                    console.log(res);
                    socket.close();
                    setTimeout(()=>progress.remove(), 3000);
                    //sb.removeClass('disabled');
                });
            }, 'json');
        }
    });
});