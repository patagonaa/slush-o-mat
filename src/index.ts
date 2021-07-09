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

class SlushViewModel {
    public sugarGPer100ml = ko.observable<number>();
    public quantityTotalL = ko.observable<number>(5.0);
    public requiredSugarGL = ko.observable<number>(140);

    public requiredSugarTotalG = ko.computed<number>(() => this.quantityTotalL() * this.requiredSugarGL());

    public includedSugarG = ko.computed<number>(() => this.sugarGPer100ml() * 10 * this.quantityTotalL());
    public sugarToAddG = ko.computed<number>(() => Math.max(this.requiredSugarTotalG() - this.includedSugarG(), 0));
    public waterToAddL = ko.computed<number>(() => Math.max(((this.sugarGPer100ml() * 10) / this.requiredSugarGL() * this.quantityTotalL()) - this.quantityTotalL(), 0));
}

ko.applyBindings(new SlushViewModel(), document.getElementById("main-form"));