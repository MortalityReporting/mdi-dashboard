import {DiffType} from './diff-type';

/**
 * Helper function to mark a single field as invalid with proper formatting
 */
export function markFieldInvalid(instance: any, field: DiffType, propertyName: string): void {
    field.style = 'invalid';

    if (instance.expected) {
        try {
            const expectedValue = (instance.expected as any)[propertyName];
            if (expectedValue !== undefined) {
                field.expected = typeof expectedValue === 'object'
                    ? JSON.stringify(expectedValue, null, 4)
                    : String(expectedValue);
                field.difference = `<pre><span class="diff-removed-color">${field.expected}</span></pre>`;
            }
        } catch (e) {}
    }

    if (instance.actual) {
        try {
            const actualValue = (instance.actual as any)[propertyName];
            if (actualValue !== undefined) {
                field.actual = typeof actualValue === 'object'
                    ? JSON.stringify(actualValue, null, 4)
                    : String(actualValue);
                field.difference = `<pre><span class="diff-added-color">${field.actual}</span></pre>`;
            }
        } catch (e) {}
    }
}

/**
 * Helper function to mark all DiffType properties as invalid when a resource is missing
 * This can be used by any diff class that doesn't extend a base class
 */
export function markAllFieldsInvalid(instance: any): void {
    instance.style = 'invalid';

    // Iterate through all properties and mark DiffType instances as invalid
    Object.keys(instance).forEach(key => {
        const value = instance[key];
        if (value instanceof DiffType) {
            markFieldInvalid(instance, value, key);
        }
    });
}
