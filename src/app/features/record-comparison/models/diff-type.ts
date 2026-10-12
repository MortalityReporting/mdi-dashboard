export class DiffType
{
    style: string;
    actual: string;
    expected: string;
    difference: string;

    constructor()
    {
        this.actual = "";
        this.expected = "";
        this.difference = "";
        this.style = null;
    }

    static doDiff( parts: any ): [string,string]
    {
        var html = "<pre>";
        let style = 'valid';

        parts.map( part => {
            let span = "<span>";

            if (part.added != undefined && part.added == true)
            {
                style = 'invalid';
                span = '<span class="diff-added-color">';
            }
            else if (part.removed != undefined && part.removed == true)
            {
                style = 'invalid';
                span = '<span class="diff-removed-color">';
            }

            html += span + part.value + '</span>';
        });

        html += "</pre>";

        return [style,html];
    }
}

