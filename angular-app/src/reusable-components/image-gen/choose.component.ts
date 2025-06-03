import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-choose',
  templateUrl: './choose.component.html',
})
export class ChooseComponent {
  @Output() optionSelected = new EventEmitter<string>();

  chooseOption(option: string) {
    this.optionSelected.emit(option); // tell PipelineComponent what was clicked
  }
}
