export function pluginMd({ render, inject }?: OptionMd): import("vite").Plugin;
/**
 * /**
 */
export type OptionMd = {
    inject: boolean;
    render: {
        [type: string]: (token: import("marked").Token) => import("marked").Token;
    };
};
