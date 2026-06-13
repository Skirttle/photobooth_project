// handles polaroid frame selection and reloads the page with selected template
document.addEventListener('DOMContentLoaded', function() {
    const frameButtons = [
        { id: 'default', template: 'polaroidDefaultTemp.png' },
        { id: 'nagano', template: 'naganoFrame.png' },
        { id: 'jungle', template: 'jungleFrame.png' },
        { id: 'gigi', template: 'gigiFrame.png' },
        { id: 'idle', template: 'miniIdleFrame.png' },
        { id: 'blackpink', template: 'blackpinkFrame.png' }
    ];


    frameButtons.forEach(btn => {
        const button = document.getElementById(btn.id);
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                // navigates to polaroid.html with the selected template as a query parameter
                const url = new URL(window.location.origin + window.location.pathname.replace('polaroidFrameSel.html', 'polaroid.html'));
                url.searchParams.set('template', btn.template);
                console.log('Frame selected:', btn.id, 'Template:', btn.template);
                console.log('Navigating to URL:', url.toString());
                window.location.href = url.toString();
            });
        }
    });

    // show the selected template to user if present in the URL
    const params = new URLSearchParams(window.location.search);
    const selectedTemplate = params.get('template');
    if (selectedTemplate) {
        const container = document.getElementById('selectedTemplateContainer');
        if (container) {
            container.innerHTML = `<p>Selected Template:</p><img src="assets/polaroidFrames/${selectedTemplate}" style="max-width:200px;">`;
        }
    }
});
