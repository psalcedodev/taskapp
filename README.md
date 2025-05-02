# taskapp

## Security & Compliance Notes for Child PINs

- **Current Approach:**

  - Child PINs are stored in plaintext for ease of use and parent accessibility.
  - Only authenticated parents can view or reset their child's PIN.
  - The PIN is used solely for accessing the child's virtual bank/shop, not for sensitive or financial actions.

- **Future Considerations:**

  - Before public launch or handling real payments, review and update security practices for storing and managing PINs.
  - Evaluate the need for hashing or encrypting PINs if they become more sensitive or are used for higher-risk actions.
  - Assess compliance requirements (e.g., COPPA, GDPR, PCI DSS) for handling children's data and payment information.
  - Implement audit logging for PIN access and changes if required by regulations or for accountability.
  - Strengthen parent authentication (consider 2FA) before allowing access to sensitive child data or payment features.

- **Action Item:**
  - Revisit this decision and perform a security/privacy review before enabling payments or launching publicly.
