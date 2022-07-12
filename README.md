## Welcome to GitHub Pages

You can use the [editor on GitHub](https://github.com/i3ernie/three-domevents/edit/master/README.md) to maintain and preview the content for your website in Markdown files.

Whenever you commit to this repository, GitHub Pages will run [Jekyll](https://jekyllrb.com/) to rebuild the pages in your site, from the content in your Markdown files.

### useage

easy-to-use

```javascript
    DEH = new DomEvents( VP.camera, VP.renderer.domElement );

    let activeWorld = new THREE.Object3D();
    activeWorld.name = "active_world";
    VP.scene.add( activeWorld );


    let world = new THREE.Object3D();
    world.name = "world";
    VP.scene.add( world );

    DEH.activate( activeWorld ); //or for global ( VP.Scene )
```

... [example](https://i3ernie.github.io/three-domevents/example).

### Jekyll Themes

Your Pages site will use the layout and styles from the Jekyll theme you have selected in your [repository settings](https://github.com/i3ernie/three-domevents/settings/pages). The name of this theme is saved in the Jekyll `_config.yml` configuration file.

### Support or Contact

Having trouble with Pages? Check out our [documentation](https://docs.github.com/categories/github-pages-basics/) or [contact support](https://support.github.com/contact) and we’ll help you sort it out.
