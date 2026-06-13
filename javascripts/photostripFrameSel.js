DocumentTimeline.addEventListener('DOMContentLoaded', function() {
    const frameButtons = [
        {id: 'photostripDefault', template: 'photostripDefaultTemp.png'},
        {id: 'music', template: 'photostripMusicTemp.png'},
        {id: 'chiikawa', template: 'photostripChiikawaTemp.png'}
    ];

    frameButtons.forEach(btn => {
        const button = document.getElementById(btn.id);
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const url = new URL(window.location.origin + window.location.pathname.replace('photostripFrameSel.html', 'photostrip.html'));
                url.searchParams.set('template', btn.template);
                console.log('Frame selected:', btn.id, 'Template:', btn.template);
                console.log('Navigating to URL:', url.toString());
                window.location.href = url.toString();
            });
        }
    });

    const params = URLSearchParams(window.location.search);
    const selectedTemplate = params.get('template');
    if (selectedTemplate) {
        const container = document.getElementById('selectedTemplateContainer');
        if (container) {
            container.innerHTML = `<p>Selected Template:</p><img src="assets/photostripFrames/${selectedTemplate}" style="max-width:200px;">`;
        }
    }
});