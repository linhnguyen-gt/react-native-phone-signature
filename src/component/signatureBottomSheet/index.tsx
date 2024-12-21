import { Modal } from 'react-native';
import { Box, Text, Touchable } from '..';

type SignatureBottomSheetProps = {
  isVisible: boolean;
  onClose: () => void;
  renderSignaturePad: React.ReactNode;
  clearSignature: () => void;
  saveSignature: () => void;
  backgroundColorButton?: string;
};

const SignatureBottomSheet: React.FC<SignatureBottomSheetProps> = ({
  isVisible,
  onClose,
  renderSignaturePad,
  clearSignature,
  saveSignature,
  backgroundColorButton,
}) => {
  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <Box
        flex={1}
        backgroundColor="rgba(0, 0, 0, 0.5)"
        justifyContent="flex-end"
      >
        <Box
          backgroundColor="#FFFFFF"
          borderTopLeftRadius={24}
          borderTopRightRadius={24}
          paddingTop={20}
          paddingHorizontal={16}
          paddingBottom={24}
        >
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            position="relative"
            marginBottom={12}
          >
            <Text
              fontSize={20}
              fontWeight="600"
              color="#1a1a1a"
              textAlign="center"
            >
              Your Signature
            </Text>
            <Touchable
              position="absolute"
              right={0}
              top={0}
              padding={8}
              onPress={onClose}
            >
              <Text fontSize={18} color="#666666">
                ✕
              </Text>
            </Touchable>
          </Box>

          <Text
            fontSize={14}
            color="#666666"
            textAlign="center"
            marginBottom={16}
          >
            Please sign within the box below
          </Text>

          <Box
            height={300}
            backgroundColor="#ffffff"
            borderRadius={12}
            shadowColor="#000"
            shadowOffset={{
              width: 0,
              height: 2,
            }}
            shadowOpacity={0.1}
            shadowRadius={8}
            elevation={5}
            borderWidth={1}
            borderColor="#E5E7EB"
            marginBottom={20}
            overflow="hidden"
          >
            {renderSignaturePad}
          </Box>

          <Box gap={12}>
            <Box flexDirection="row" gap={12}>
              <Touchable
                paddingVertical={14}
                borderRadius={12}
                alignItems="center"
                justifyContent="center"
                flex={1}
                backgroundColor="#F3F4F6"
                borderWidth={1}
                borderColor="#E5E7EB"
                onPress={clearSignature}
              >
                <Text color="#374151" fontSize={16} fontWeight="500">
                  Clear
                </Text>
              </Touchable>
              <Touchable
                paddingVertical={14}
                borderRadius={12}
                alignItems="center"
                justifyContent="center"
                flex={1}
                shadowOffset={{
                  width: 0,
                  height: 2,
                }}
                shadowOpacity={0.25}
                shadowRadius={4}
                elevation={4}
                backgroundColor={backgroundColorButton}
                shadowColor={backgroundColorButton}
                onPress={saveSignature}
              >
                <Text color="#FFFFFF" fontSize={16} fontWeight="600">
                  Save
                </Text>
              </Touchable>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default SignatureBottomSheet;
