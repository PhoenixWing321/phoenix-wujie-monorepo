import { defineComponent, h, PropType } from 'vue';
import type { BaseProps } from '../../types';
import './style.css';

export interface ButtonProps extends BaseProps {
    onClick?: () => void;
    disabled?: boolean;
    type?: 'primary' | 'secondary' | 'default';
}

export const Button = defineComponent({
    name: 'Button',
    props: {
        onClick: {
            type: Function as PropType<() => void>,
            required: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        type: {
            type: String as PropType<'primary' | 'secondary' | 'default'>,
            default: 'default'
        }
    },
    setup(props, { slots }) {
        return () => h(
            'button',
            {
                class: ['ui-button', `ui-button--${props.type}`],
                disabled: props.disabled,
                onClick: props.onClick
            },
            slots.default?.()
        );
    }
}); 