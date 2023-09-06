import * as ko from "knockout";
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

ko.bindingHandlers.floatText = {
    update: function (element: HTMLInputElement, valueAccessor, allBindings) {
        var value = valueAccessor();
        var valueUnwrapped = ko.unwrap<number>(value);

        var decimals = isNaN(parseInt(allBindings.get("decimals"))) ? 2 : parseInt(allBindings.get("decimals"));
        if (isNaN(valueUnwrapped)) {
            element.value = '';
        } else {
            element.value = valueUnwrapped.toFixed(decimals);
        }
    }
};

type IngredientType = 'sugar' | 'ethanol';

const sugarGPerMol = 342.3; // g/mol

const ethanolDensity = 0.7893 * 1000; // g/l
const ethanolGPerMol = 46.07; // g/mol

class Ingredient {
    public ingredientType: KnockoutObservable<IngredientType> = ko.observable<IngredientType>('sugar');
    public fraction: KnockoutObservable<string> = ko.observable('');
    public totalAmount: KnockoutObservable<string> = ko.observable('5');
    public molWeight = ko.pureComputed(() => {
        const ingredientType = this.ingredientType();

        if (ingredientType == "sugar") {
            const sugarGPer100ml = +this.fraction();
            const sugarGTotal = sugarGPer100ml * 10 * +this.totalAmount();
            return sugarGTotal / sugarGPerMol; // g/mol
        } else if (ingredientType == "ethanol") {
            const ethanolVolFraction = +this.fraction() / 100;
            const ethanolGramTotal = ethanolVolFraction * ethanolDensity * +this.totalAmount();
            return ethanolGramTotal / ethanolGPerMol; 
        }
    });

    private units = {
        "sugar": { unit: 'g/100ml' },
        "ethanol": { unit: '%vol' }
    }

    public getUnitForIngredient(type: IngredientType) {
        return this.units[type].unit;
    }
}

const freezingPointDepressionWater = -1.86; // K*kg/mol
class SlushViewModel {
    public ingredients: KnockoutObservableArray<Ingredient> = ko.observableArray<Ingredient>();

    constructor() {
        this.addIngredient();
        this.loadStateFromHash();
    }

    public addIngredient() {
        this.ingredients.push(new Ingredient());
    }

    public deleteIngredient(index: number){
        this.ingredients.splice(index, 1);
    }

    // private saveStateToHash() {
    //     window.location.hash = `sugarGPer100ml=${this.sugarGPer100ml().toString()}`;
    // }

    private loadStateFromHash() {
        let decodedHash = window.location.hash;
        if (decodedHash == null)
            return;

        let matches = decodedHash.match(/sugarGPer100ml=([^&]+)/);
        if (matches == null)
            return;

        this.ingredients()[0].fraction(''+parseFloat(matches[1]));
    }

    public molWeightTotal = ko.pureComputed(() => this.ingredients().map(x => +x.molWeight()).reduce((x, y) => x + y, 0));
    public quantityTotalL = ko.pureComputed(() => this.ingredients().map(x => +x.totalAmount()).reduce((x, y) => x + y, 0));
    public freezingPoint = ko.pureComputed(() => freezingPointDepressionWater * (this.molWeightTotal() / this.quantityTotalL()));

    public requiredFreezingPoint = ko.observable(-0.761);

    public requiredMolWeight = ko.pureComputed(() => this.requiredFreezingPoint() * this.quantityTotalL() / freezingPointDepressionWater);
    public sugarToAddG = ko.pureComputed(() => Math.max((this.requiredMolWeight() - this.molWeightTotal()) * sugarGPerMol, 0));

    public requiredWater = ko.pureComputed(() => freezingPointDepressionWater * (this.molWeightTotal() / this.requiredFreezingPoint()));
    public waterToAddL = ko.pureComputed(() => Math.max(this.requiredWater() - this.quantityTotalL(), 0));
}

ko.applyBindings(new SlushViewModel(), document.getElementById("main-form"));