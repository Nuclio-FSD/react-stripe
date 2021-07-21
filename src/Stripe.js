import React from 'react';

import {
  CardElement,
  StripeProvider,
  Elements,
  injectStripe,
} from 'react-stripe-elements';
import axios from 'axios';

const handleBlur = () => {
  console.log('[blur]');
};
const handleChange = change => {
  console.log('[change]', change);
};
const handleFocus = () => {
  console.log('[focus]');
};
const handleReady = () => {
  console.log('[ready]');
};

const createOptions = (fontSize, padding) => {
  return {
    style: {
      base: {
        fontSize,
        color: '#424770',
        letterSpacing: '0.025em',
        fontFamily: 'Source Code Pro, monospace',
        '::placeholder': {
          color: '#aab7c4',
        },
        ...(padding ? { padding } : {}),
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };
};

class _CreatePaymentMethod extends React.Component {
  state = {
    error: null,
    processing: false,
    message: null,
  };

  handleSubmit = ev => {
    ev.preventDefault();
    if (this.props.stripe && this.props.elements) {
      this.props.stripe
        .createPaymentMethod({
          type: 'card',
          card: this.props.elements.getElement('card'),
        })
        .then(payload => {
          if (payload.error) {
            this.setState({
              error: `Failed to create PaymentMethod: ${payload.error.message}`,
              processing: false,
            });
            console.log('[error]', payload.error);
          } else {
            this.setState({
              message: `Created PaymentMethod: ${payload.paymentMethod.id}`,
              processing: false,
            });
            console.log('[paymentMethod]', payload.paymentMethod);
          }
        });
      this.setState({ processing: true });
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          stripe.createPaymentMethod
          <CardElement
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        {this.state.error && <div className="error">{this.state.error}</div>}
        {this.state.message && (
          <div className="message">{this.state.message}</div>
        )}
        <button disabled={this.state.processing}>
          {this.state.processing ? 'Processing…' : 'Create'}
        </button>
      </form>
    );
  }
}

const CreatePaymentMethod = injectStripe(_CreatePaymentMethod);

class _HandleCardPayment extends React.Component {
  state = {
    clientSecret: null,
    error: null,
    disabled: false,
    succeeded: false,
    processing: false,
    message: null,
  };

  handleSubmit = async ev => {
    ev.preventDefault();
    if (this.props.stripe && this.props.elements) {
      const res = await axios.post('http://localhost:5001/payments/create');
      this.props.stripe
        .confirmCardPayment(res.data.intent, {
          payment_method: {
            card: this.props.elements.getElement('card'),
          },
        })
        .then(payload => {
          if (payload.error) {
            this.setState({
              error: `Charge failed: ${payload.error.message}`,
              disabled: false,
            });
            console.log('[error]', payload.error);
          } else {
            this.setState({
              succeeded: true,
              message: `Charge succeeded! PaymentIntent is in state: ${payload.paymentIntent.status}`,
            });
            console.log('[PaymentIntent]', payload.paymentIntent);
          }
        });
      this.setState({ disabled: true, processing: true });
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          stripe.confirmCardPayment
          <CardElement
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        {this.state.error && <div className="error">{this.state.error}</div>}
        {this.state.message && (
          <div className="message">{this.state.message}</div>
        )}
        {!this.state.succeeded && (
          <button disabled={this.state.disabled}>
            {this.state.processing ? 'Processing…' : 'Pay'}
          </button>
        )}
      </form>
    );
  }
}

const HandleCardPayment = injectStripe(_HandleCardPayment);

class _HandleCardSetup extends React.Component {
  state = {
    clientSecret: null,
    error: null,
    disabled: false,
    succeeded: false,
    processing: false,
    message: null,
  };

  handleSubmit = async ev => {
    ev.preventDefault();
    if (this.props.stripe && this.props.elements) {
      const res = await axios.post('http://localhost:5001/payments/setup-intent');
      this.props.stripe
        .confirmCardSetup(res.data.intent, {
          payment_method: {
            card: this.props.elements.getElement('card'),
          },
        })
        .then(payload => {
          if (payload.error) {
            this.setState({
              error: `Setup failed: ${payload.error.message}`,
              disabled: false,
            });
            console.log('[error]', payload.error);
          } else {
            this.setState({
              succeeded: true,
              message: `Setup succeeded! SetupIntent is in state: ${payload.setupIntent.status}`,
            });
            console.log('[SetupIntent]', payload.setupIntent);
          }
        });
      this.setState({ disabled: true, processing: true });
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          stripe.confirmCardSetup
          <CardElement
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        {this.state.error && <div className="error">{this.state.error}</div>}
        {this.state.message && (
          <div className="message">{this.state.message}</div>
        )}
        {!this.state.succeeded && (
          <button disabled={this.state.disabled}>
            {this.state.processing ? 'Processing…' : 'Setup'}
          </button>
        )}
      </form>
    );
  }
}

const HandleCardSetup = injectStripe(_HandleCardSetup);

class Checkout extends React.Component {
  constructor() {
    super();
    this.state = {
      elementFontSize: window.innerWidth < 450 ? '14px' : '18px',
    };
    window.addEventListener('resize', () => {
      if (window.innerWidth < 450 && this.state.elementFontSize !== '14px') {
        this.setState({ elementFontSize: '14px' });
      } else if (
        window.innerWidth >= 450 &&
        this.state.elementFontSize !== '18px'
      ) {
        this.setState({ elementFontSize: '18px' });
      }
    });
  }

  render() {
    const { elementFontSize } = this.state;
    return (
      <div className="Checkout">
        <h1>React Stripe Elements with PaymentIntents</h1>
        <Elements>
          <CreatePaymentMethod fontSize={elementFontSize} />
        </Elements>
        <Elements>
          <HandleCardPayment fontSize={elementFontSize} />
        </Elements>
        <Elements>
          <HandleCardSetup fontSize={elementFontSize} />
        </Elements>
      </div>
    );
  }
}

const StripeApp = () => {
  return (
    <StripeProvider apiKey="pk_test_51JFMmvGAk6MixywtV0fskKWl9f0bKFXtF2wHGzmOOSyk2l4eJSGWe03gQuUDLbZFWJaBt4fO16lw6Viax1blvRSR00R56umv9Z">
      <Checkout />
    </StripeProvider>
  );
};

export default StripeApp;