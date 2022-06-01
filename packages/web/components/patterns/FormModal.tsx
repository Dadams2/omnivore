import {
  ModalContent,
  ModalOverlay,
  ModalRoot,
} from '../elements/ModalPrimitives'
import { Box, HStack, VStack } from '../elements/LayoutPrimitives'
import { Button } from '../elements/Button'
import { StyledText } from '../elements/StyledText'
import { FormInput } from '../elements/FormElements'

interface FormInputProps {
  name: string
  label: string
  value?: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
  hidden?: boolean
}

interface FormModalProps {
  inputs?: FormInputProps[]
  title: string
  acceptButtonLabel?: string
  onSubmit: () => void
  onOpenChange: (open: boolean) => void
}

export function FormModal(props: FormModalProps): JSX.Element {
  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent>
        <VStack alignment="center" distribution="center">
          <StyledText style="modalHeadline">{props.title}</StyledText>
          <Box>
            <form>
              {props.inputs?.map((input) => (
                <HStack key={input.name}>
                  <StyledText style={'boldText'}>{input.label}</StyledText>
                  <FormInput
                    key={input.name}
                    type={input.type || 'text'}
                    value={input.value}
                    placeholder={input.placeholder}
                    onChange={(event) => input.onChange(event.target.value)}
                    disabled={input.disabled}
                    hidden={input.hidden}
                  />
                </HStack>
              ))}
              <HStack distribution="center">
                <Button
                  style="ctaPill"
                  onClick={() => props.onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button style="ctaPill" onClick={() => props.onSubmit}>
                  {props.acceptButtonLabel || 'Submit'}
                </Button>
              </HStack>
            </form>
          </Box>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
