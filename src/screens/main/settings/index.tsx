import React, {useEffect, useState} from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors, Fonts, Icons} from '../../../themes';
import {moderateScale} from '../../../utils/orientation';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import Css from '../../../themes/Css';
import {CustomButtonSolid} from '../../../components/CustomButton';
import {navigate} from '../../../utils/helper/RootNaivgation';
import {RootStackParamList} from '../../../types';
import {useAppDispatch, useAppSelector} from '@app/redux';
import {logout} from '@app/utils/service/AuthService';
import {showMessage} from '@app/utils/helper/Toast';
import {updateSettings} from '@app/redux/slice/user.slice';
import {updateUserSettings} from '@app/utils/service/UserService';
import {debounce} from 'lodash';

type InfoSettingsKeys = 'notification' | 'preferences' | 'email_notification';

const Setting = () => {
  const dispatch = useAppDispatch();
  const _settings = useAppSelector(state => state.user.settings);

  const [infoSettings, setInfoSettings] = useState<
    Record<InfoSettingsKeys, boolean>
  >({
    notification: _settings.notification,
    preferences: _settings.preferences,
    email_notification: _settings.email_notification,
  });

  const updateInfo = (key: InfoSettingsKeys, value: boolean) => {
    setInfoSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const navigatorList: {label: string; navigateTo: keyof RootStackParamList}[] =
    [
      {label: 'Terms & Conditions', navigateTo: 'TermsCondition'},
      {label: 'Privacy Policy', navigateTo: 'PrivacyPolicy'},
    ];

  async function handleLogout() {
    const result = await dispatch(logout());
    showMessage(result?.message);
  }

  const debouncedSubmit = debounce(async settings => {
    try {
      const result = await dispatch(
        updateUserSettings({
          email_notifications: settings.email_notification,
          notifications: settings.notification,
          preferences: settings.preferences,
        }),
      );
      // showMessage(result?.message);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  }, 500);

  useEffect(() => {
    debouncedSubmit(infoSettings);
  }, [infoSettings]);

  return (
    <GeneralTemplate isSearch={false}>
      <Text style={styles.textStyle}>Settings</Text>
      <View style={styles.container}>
        {['notification', 'preferences', 'email_notification'].map(
          (key, index) => (
            <ToggleOption
              key={index}
              label={
                key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
              }
              status={infoSettings[key as InfoSettingsKeys]} // Type-safe access
              onToggle={value => {
                updateInfo(key as InfoSettingsKeys, value); // Cast key to correct type
                dispatch(
                  updateSettings({
                    key: key as keyof typeof infoSettings,
                    value,
                  }),
                );
              }}
            />
          ),
        )}

        <View style={styles.line} />
        {navigatorList.map((item, index) => {
          return (
            <TouchableOpacity
              key={index}
              style={[styles.onOffMainContainer, Css.jcfs, Css.g3]}
              activeOpacity={0.9}
              onPress={() => navigate(item.navigateTo)}>
              <Image source={Icons.arrow_right} style={Css.icon16} />
              <Text style={[styles.labelText, {color: Colors.Aztec_Gold}]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <CustomButtonSolid
        label="Logout"
        onPress={() => {
          Alert.alert(
            'Confirm Logout',
            'Are you sure you want to log out?',
            [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Logout',
                onPress: () => handleLogout(),
                style: 'destructive',
              },
            ],
            {cancelable: true},
          );
        }}
      />
    </GeneralTemplate>
  );
};

const ToggleOption = ({
  label,
  status,
  onToggle,
}: {
  label: string;
  status: boolean;
  onToggle: (value: boolean) => void;
}) => (
  <View style={styles.onOffMainContainer}>
    <Text style={styles.labelText}>{`${label}:`}</Text>
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onToggle(!status)}
      style={[styles.onOffContainer, status ? Css.fdr : Css.fdrr]}>
      <View
        style={[
          styles.onOffDot,
          {backgroundColor: status ? Colors.Aztec_Gold : Colors.Old_Silver},
        ]}
      />
      <Text
        style={[
          styles.onOffText,
          {color: status ? Colors.Aztec_Gold : Colors.Old_Silver},
        ]}>
        {status ? 'ON' : 'OFF'}
      </Text>
    </TouchableOpacity>
  </View>
);

export default Setting;

const styles = StyleSheet.create({
  textStyle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(17),
    marginTop: moderateScale(20),
  },
  container: {
    marginTop: moderateScale(15),
    width: '100%',
    backgroundColor: Colors.white,
    shadowOpacity: 1,
    shadowColor: '#4514A517',
    shadowOffset: {
      height: 1,
      width: 1,
    },
    elevation: 5,
    borderRadius: moderateScale(10),
    paddingVertical: moderateScale(20),
    gap: moderateScale(15),
  },
  labelText: {
    color: Colors.Old_Silver,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(14),
    textTransform: 'capitalize'
  },
  onOffContainer: {
    width: moderateScale(60),
    height: moderateScale(25),
    borderRadius: moderateScale(30),
    backgroundColor: Colors.grayish,
    alignItems: 'center',
    flexDirection: 'row',
  },
  onOffDot: {
    height: moderateScale(15),
    width: moderateScale(15),
    borderRadius: moderateScale(15),
    margin: moderateScale(5),
  },
  onOffMainContainer: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onOffText: {
    color: Colors.Old_Silver,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: moderateScale(12),
  },
  line: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.gainsboro,
  },
});
