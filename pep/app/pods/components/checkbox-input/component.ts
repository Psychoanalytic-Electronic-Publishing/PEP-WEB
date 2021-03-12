import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { dasherize } from '@ember/string';
import Component from '@glimmer/component';

interface CheckboxInputArgs {
    onChange?: (newValue: boolean, event: Event) => void;
    inline?: boolean;
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    preventDefault?: boolean;
    stopPropagation?: boolean;
    name?: string;
}

export default class CheckboxInput extends Component<CheckboxInputArgs> {
    inputId: string = `checkbox-input-${guidFor(this)}`;

    get preventDefault(): boolean {
        return this.args.preventDefault ?? false;
    }

    get stopPropagation(): boolean {
        return this.args.stopPropagation ?? false;
    }

    get name() {
        const name = this.args.name ?? this.args.label;
        return name ? dasherize(name.replace(/\W/g, '')) : '';
    }

    /**
     * Invoke the checkbox's `onChange` method if it was passed in
     * as an argument
     *
     */
    @action
    onChange(event: HTMLElementEvent<HTMLInputElement>): void {
        if (this.preventDefault) {
            event.preventDefault();
        }

        if (this.stopPropagation) {
            event.stopPropagation();
        }
        // Always get the current checked value and send it as an argument for the `onChange` event
        this.args.onChange?.(event.target.checked, event);
    }
}
