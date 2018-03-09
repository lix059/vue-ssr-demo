import createApp from './app';

export default function (context) {
    const {app, store} = createApp()
    // 找到所有 prefetchData 方法
    let components = app.components;
    let prefetchFns = [];
    for (let key in components) {
        if (!components.hasOwnProperty(key)) continue;
        let component = components[key];
        if(component.prefetchData) {
            prefetchFns.push(component.prefetchData(key))
        }
    }

    return Promise.all(prefetchFns).then((res) => {
        res.forEach((item, key) => {
            Vue.set(store.state, `${item.tagName}`, item.data);
        });
        context.state = store.state;
        return app;
    });
};
