import { InstructionMergeWriteBehavior } from './instructionMergeWriteBehavior.model';
import {
  InstructionMetadataFactory,
  InstructionMetadata,
  InstructionParsingMetadata,
} from './instructionMetadata.model';
import { InstructionWriteBehavior } from './instructionWriteBehavior.model';
import { InstructionDefaultWriteBehavior } from './instructionDefaultWriteBehavior.model';
import { InstructionBreakWriteBehavior } from './instructionBreakWriteBehavior.model';
import { Operation, OperationContext } from '../../config/index.enum';
import { OperationErrorManager } from '../errors/operationErrorManager.model';
import { InstructionOperationError } from '../errors/instructionOperationError.model';
import { ParserService } from '../../services/parser.service';
import { Tab } from '../tab/tab.model';

export class Instruction {
  public readonly metadata: InstructionMetadata;
  public readonly parsingMetadata: InstructionParsingMetadata;
  public readonly source: string;
  public writeBehaviour: InstructionWriteBehavior;

  constructor(source: string, parsingMetadata = new InstructionParsingMetadata()) {
    this.source = source.trim();
    this.metadata = InstructionMetadataFactory.getInstructionMetadata(this.source);
    this.parsingMetadata = parsingMetadata;
    this.writeBehaviour = this.getWriteBehavior();
  }

  public writeToTab(tab: Tab, errorReporter?: OperationErrorManager): void {
    if (this.metadata.isRead) {
      this.writeBehaviour.writeToTab(tab, errorReporter);
    } else {
      if (errorReporter) {
        errorReporter.addError(
          new InstructionOperationError(
            this,
            Operation.leitura,
            OperationContext.instructionGeneral,
            this.metadata.readFailDescription,
          ),
        );
      }
    }
  }

  public parseInstructionsToApply(): Instruction[] {
    if (!this.metadata.methodInstructionsStrToApply) return [];

    if (!this.parsingMetadata.parserConfig)
      throw Error(`[${InstructionWriteBehavior.name}] Unable to create parser to read instructions to apply method.`);

    const parser = new ParserService(this.metadata.methodInstructionsStrToApply, this.parsingMetadata.parserConfig);
    return parser.parse();
  }

  private getWriteBehavior(): InstructionWriteBehavior {
    if (this.metadata.isMethod) {
      switch (this.metadata.methodName.toUpperCase()) {
        case 'BREAK':
          return new InstructionBreakWriteBehavior(this);
        case 'MERGE':
        case 'M':
          return new InstructionMergeWriteBehavior(this);
        default:
          return new InstructionDefaultWriteBehavior(this);
      }
    } else {
      return new InstructionDefaultWriteBehavior(this);
    }
  }
}
