export function createHtml(raw: any, text?: any): {
    type: string;
    block: boolean;
    pre: boolean;
    raw: any;
    text: any;
};
export function createCode(block: import("marked").Token, replace: any): any;
export function pluginMarkdown({ render, imports }?: OptionMd): import("vite").Plugin;
/**
 * /**
 */
export type OptionMd = {
    imports: boolean;
    render: {
        [type: string]: (token: import("marked").Token & {
            preview?: string;
            options?: string[];
        }) => import("marked").Token;
    };
};
